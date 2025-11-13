import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { DiputadoPeriodo, getCurrentMilitancia } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";

interface ParliamentChartProps {
  legislators: DiputadoPeriodo[];
  size?: number;
}

// Color mapping for Chilean political parties
const PARTY_COLORS: { [key: string]: string } = {
  // Right-wing parties
  PNL: "#00008B", // Partido Nacional Libertario - Dark Blue
  PREP: "#0066CC", // Partido Republicano - Dodger Blue
  UDI: "#1E90FF", // Union Demócrata Independiente - Blue
  RN: "#0080FF", // Renovación Nacional - Light Blue
  EVOP: "#4169E1", // Evópoli - Royal Blue

  // Center and Center-Right
  DEM: "#87CEEB", // Demócratas - Sky Blue
  DC: "#FFA500", // Partido Demócrata Cristiano - Orange
  AMA: "#FFFF00", // Amarillos por Chile - Yellow

  // Center-Left
  PSC: "#FF8C00", // Partido Social Cristiano - Dark Orange
  PPD: "#FF6347", // Partido por la Democracia - Tomato
  PS: "#DC143C", // Partido Socialista - Crimson
  PR: "#FF4500", // Partido Radical - Orange Red
  LIBERAL: "#C71585", // Partido Liberal - Medium Violet Red
  PAH: "#FF69B4", // Partido Accion Humanista - Hot Pink
  PH: "#FF1493", // Partido Humanista - Deep Pink

  // Left-wing parties
  PC: "#B22222", // Partido Comunista - Fire Brick
  FA: "#9932CC", // Frente Amplio - Dark Orchid
  CS: "#8B008B", // Comunes - Dark Magenta
  PEV: "#4B0082", // Partido Ecologista Verde - Indigo

  // Regional and Indigenous
  FRVS: "#228B22", // Federación Regionalista Verde Social - Forest Green

  // Independent
  IND: "#808080", // Independientes - Gray

  // Default for unknown parties
  DEFAULT: "#A9A9A9", // Dark Gray
};

// Political alignment classification
const PARTY_ALIGNMENT: { [key: string]: "left" | "center" | "right" } = {
  // Left-wing parties
  PC: "left",
  FA: "left",
  CS: "left",
  PEV: "left",

  // Center-Left
  PS: "left",
  PPD: "left",
  PR: "left",
  LIBERAL: "left",
  PAH: "left",
  PH: "left",
  PSC: "center",

  // Center and Center-Right
  DC: "center",
  AMA: "center",
  DEM: "center",

  // Right-wing parties
  EVOP: "right",
  RN: "right",
  UDI: "right",
  PREP: "right",
  PNL: "right",

  // Regional and Independent
  FRVS: "center",
  IND: "center",
};

export default function ParliamentChart({
  legislators,
  size = 300,
}: ParliamentChartProps) {
  // Group legislators by party
  const partyGroups = legislators.reduce((acc, leg) => {
    const currentParty = getCurrentMilitancia(leg.Diputado);
    const partyId = currentParty?.Partido.Alias || "IND";

    if (!acc[partyId]) {
      acc[partyId] = {
        partyName: currentParty?.Partido.Nombre || "Independiente",
        partyAlias: partyId,
        count: 0,
        color: PARTY_COLORS[partyId] || PARTY_COLORS.DEFAULT,
        alignment: PARTY_ALIGNMENT[partyId] || "center",
      };
    }
    acc[partyId].count++;
    return acc;
  }, {} as Record<string, { partyName: string; partyAlias: string; count: number; color: string; alignment: "left" | "center" | "right" }>);

  // Separate parties by alignment
  const leftParties = Object.entries(partyGroups)
    .filter(([, party]) => party.alignment === "left")
    .sort(([, a], [, b]) => b.count - a.count);

  const centerParties = Object.entries(partyGroups)
    .filter(([, party]) => party.alignment === "center")
    .sort(([, a], [, b]) => b.count - a.count);

  const rightParties = Object.entries(partyGroups)
    .filter(([, party]) => party.alignment === "right")
    .sort(([, a], [, b]) => b.count - a.count);

  // Arrange parties: left-wing on left side (largest at edge), right-wing on right side (largest at edge)
  // Left side: reverse order so largest is at the leftmost
  // Right side: normal order so largest is at the rightmost
  const sortedParties = [
    ...leftParties,
    ...centerParties,
    ...rightParties.reverse(),
  ];

  // Calculate positions for each seat in a semicircle
  const totalSeats = legislators.length;
  const rows = 5; // Number of concentric rows

  // Calculate how many seats per row (more in outer rows)
  const baseSeatsPerRow = 20;
  const seatsPerRowArray = Array.from({ length: rows }, (_, i) =>
    Math.round(baseSeatsPerRow + i * 8)
  );

  // Adjust to match total seats
  const totalCalculated = seatsPerRowArray.reduce((a, b) => a + b, 0);
  const adjustment = totalSeats - totalCalculated;
  seatsPerRowArray[rows - 1] += adjustment; // Add/subtract from outermost row

  // Generate all positions, sorted by angle for left-to-right filling
  const allPositions: { x: number; y: number; angle: number }[] = [];

  for (let row = 0; row < rows; row++) {
    const radius = (size / 2) * (0.5 + row * 0.12); // Inner to outer
    const seatsInRow = seatsPerRowArray[row];

    for (let seat = 0; seat < seatsInRow; seat++) {
      // Full semicircle: angle from π (180° left) to 0 (0° right)
      const angle = Math.PI * (1 - seat / (seatsInRow - 1));

      // Calculate position
      const x = size / 2 + radius * Math.cos(angle);
      const y = size / 2 - radius * Math.sin(angle);

      allPositions.push({ x, y, angle });
    }
  }

  // Sort positions by angle (descending: left to right)
  allPositions.sort((a, b) => b.angle - a.angle);

  // Assign party colors to seats in order
  const seats: { x: number; y: number; color: string; partyAlias: string }[] =
    [];
  let currentPartyIndex = 0;
  let currentPartySeats = 0;
  let [, currentPartyData] = sortedParties[0] || ["IND", partyGroups["IND"]];

  for (let i = 0; i < totalSeats; i++) {
    const position = allPositions[i];

    // Move to next party if current is full
    if (currentPartySeats >= currentPartyData.count) {
      currentPartyIndex++;
      if (currentPartyIndex < sortedParties.length) {
        [, currentPartyData] = sortedParties[currentPartyIndex];
        currentPartySeats = 0;
      }
    }

    seats.push({
      x: position.x,
      y: position.y,
      color: currentPartyData.color,
      partyAlias: currentPartyData.partyAlias,
    });

    currentPartySeats++;
  }

  // Calculate seat size based on container
  const seatSize = Math.max(6, Math.min(12, size / 40));

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Composición del Congreso
      </ThemedText>
      <ThemedText style={styles.subtitle}>{totalSeats} Diputados</ThemedText>

      {/* Parliament Semicircle */}
      <View
        style={[
          styles.parliamentContainer,
          { width: size, height: size / 2 + 20 },
        ]}
      >
        <View style={[styles.parliament, { width: size, height: size / 2 }]}>
          {seats.map((seat, index) => (
            <View
              key={index}
              style={[
                styles.seat,
                {
                  left: seat.x - seatSize / 2,
                  top: seat.y - seatSize / 2,
                  width: seatSize,
                  height: seatSize,
                  backgroundColor: seat.color,
                  borderRadius: seatSize / 2,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Legend */}
      <ThemedView style={styles.legend}>
        {sortedParties.map(([partyId, party]) => (
          <View key={partyId} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: party.color }]}
            />
            <ThemedText style={styles.legendText}>
              {party.partyAlias} ({party.count})
            </ThemedText>
          </View>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
  },
  title: {
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: "center",
  },
  parliamentContainer: {
    overflow: "visible",
    marginBottom: 20,
  },
  parliament: {
    position: "relative",
  },
  seat: {
    position: "absolute",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.2)",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
