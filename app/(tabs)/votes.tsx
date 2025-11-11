import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CongressAPI from "@/services/CongressAPIService";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function VotesScreen() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [searchYear, setSearchYear] = useState(year);

  const loadVotes = useCallback(
    async (yearToLoad = year) => {
      try {
        setLoading(true);
        const data = await CongressAPI.getVotesByYear(parseInt(yearToLoad));
        setVotes(data);
        setYear(yearToLoad);
      } catch (error) {
        console.error("Error cargando votaciones:", error);
      } finally {
        setLoading(false);
      }
    },
    [year]
  );

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  const handleSearch = () => {
    if (searchYear && searchYear.length === 4) {
      loadVotes(searchYear);
    }
  };

  const getResultColor = (resultado: any) => {
    const nombre = resultado?.Nombre || "";
    if (nombre.toLowerCase().includes("aprobad")) return "#4CAF50";
    if (nombre.toLowerCase().includes("rechazad")) return "#F44336";
    return "#FFC107";
  };

  const renderVote = ({ item }: { item: any }) => (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.voteHeader}>
        <ThemedView
          style={[
            styles.resultChip,
            { backgroundColor: getResultColor(item.Resultado) },
          ]}
        >
          <ThemedText style={styles.chipText}>
            {item.Resultado?.Nombre || "Sin resultado"}
          </ThemedText>
        </ThemedView>
        <ThemedText style={styles.dateText}>
          {item.Fecha || "Sin fecha"}
        </ThemedText>
      </ThemedView>

      <ThemedText type="defaultSemiBold" style={styles.voteTitle}>
        {item.Descripcion || "Sin descripción"}
      </ThemedText>

      {item.Tipo?.Nombre && (
        <ThemedText style={styles.voteType}>
          📋 Tipo: {item.Tipo.Nombre}
        </ThemedText>
      )}

      {item.Sesion?.Numero && (
        <ThemedText style={styles.sessionInfo}>
          🏛️ Sesión N° {item.Sesion.Numero}
        </ThemedText>
      )}

      {item.ProyectoLey && (
        <ThemedText style={styles.billInfo}>
          📜 Proyecto: {item.ProyectoLey}
        </ThemedText>
      )}

      <ThemedView style={styles.voteCounts}>
        <ThemedView style={styles.voteCount}>
          <ThemedText style={styles.voteCountLabel}>A Favor</ThemedText>
          <ThemedText style={[styles.voteCountNumber, { color: "#4CAF50" }]}>
            {item.AFavor || 0}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.voteCount}>
          <ThemedText style={styles.voteCountLabel}>En Contra</ThemedText>
          <ThemedText style={[styles.voteCountNumber, { color: "#F44336" }]}>
            {item.EnContra || 0}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.voteCount}>
          <ThemedText style={styles.voteCountLabel}>Abstenciones</ThemedText>
          <ThemedText style={[styles.voteCountNumber, { color: "#FFC107" }]}>
            {item.Abstencion || 0}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#003DA5", dark: "#1D3D47" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#FFFFFF"
          name="chart.bar.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Votaciones</ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Año (ej. 2024)"
          placeholderTextColor={Colors[colorScheme ?? "light"].tabIconDefault}
          value={searchYear}
          onChangeText={setSearchYear}
          keyboardType="numeric"
          maxLength={4}
          style={[
            styles.searchInput,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              color: Colors[colorScheme ?? "light"].text,
            },
          ]}
          onSubmitEditing={handleSearch}
        />
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>
            Cargando votaciones...
          </ThemedText>
        </ThemedView>
      ) : (
        <>
          <ThemedText style={styles.statsText}>
            {votes.length} votaciones en {year}
          </ThemedText>

          <FlatList
            data={votes}
            renderItem={renderVote}
            keyExtractor={(item, index) => `vote-${index}`}
            scrollEnabled={false}
            ListEmptyComponent={
              <ThemedView style={styles.emptyContainer}>
                <ThemedText>
                  No se encontraron votaciones para {year}
                </ThemedText>
              </ThemedView>
            }
          />
        </>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  headerImage: {
    color: "#FFFFFF",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  statsText: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  voteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  resultChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  dateText: {
    fontSize: 12,
    opacity: 0.8,
  },
  voteTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  voteType: {
    fontSize: 14,
    marginVertical: 2,
    opacity: 0.8,
  },
  sessionInfo: {
    fontSize: 14,
    marginVertical: 2,
    opacity: 0.8,
  },
  billInfo: {
    fontSize: 14,
    marginVertical: 2,
    opacity: 0.8,
  },
  voteCounts: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  voteCount: {
    alignItems: "center",
  },
  voteCountLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 5,
  },
  voteCountNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
});
