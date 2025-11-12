import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import ParliamentChart from "@/components/parliament-chart";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CongressAPI from "@/services/CongressAPIService";
import { DiputadoPeriodo } from "@/types";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [legislators, setLegislators] = useState<DiputadoPeriodo[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all current legislators
      const allLegislators = await CongressAPI.getCurrentLegislators();
      console.log({ legislators: allLegislators });
      setLegislators(allLegislators);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          Cargando datos del Congreso...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#003DA5", dark: "#1D3D47" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#FFFFFF"
          name="building.columns.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🇨🇱 Congreso de Chile</ThemedText>
      </ThemedView>

      <ThemedText>Datos Abiertos del Congreso Nacional</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        Visualiza la composición actual de la Cámara de Diputados y explora
        información detallada de cada legislador.
      </ThemedText>

      {/* Parliament Visualization */}
      <ParliamentChart legislators={legislators} size={340} />

      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>
          💡 Usa las pestañas inferiores para explorar legisladores, votaciones
          y comisiones.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(0, 61, 165, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 61, 165, 0.1)",
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
