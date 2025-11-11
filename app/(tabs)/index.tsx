import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CongressAPI from "@/services/CongressAPIService";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [recentLegislators, setRecentLegislators] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar algunos legisladores
      const legislators = await CongressAPI.getCurrentLegislators();
      console.log({ legislators });
      setRecentLegislators(legislators.slice(0, 3));

      // Obtener estadísticas
      const apiStats = CongressAPI.getRequestStats();
      setStats(apiStats);
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
        Usa las pestañas inferiores para explorar legisladores, votaciones,
        comisiones y estadísticas.
      </ThemedText>

      {/* Legisladores Destacados */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">👥 Algunos Legisladores</ThemedText>
        {recentLegislators.map((leg, index) => (
          <ThemedView key={index} style={styles.legislatorItem}>
            <ThemedText>{leg.Diputado.Nombre || "Sin nombre"}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Estadísticas API */}
      {stats && (
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">📊 Estadísticas de Peticiones</ThemedText>
          <ThemedText>
            Peticiones totales: {stats.peticiones_totales}
          </ThemedText>
          <ThemedText>
            Peticiones fallidas: {stats.peticiones_fallidas}
          </ThemedText>
          <ThemedText>Tasa de éxito: {stats.tasa_exito}%</ThemedText>
        </ThemedView>
      )}
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
  quickAccessContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  quickAccessButton: {
    alignItems: "center",
    padding: 15,
    width: "48%",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
  },
  quickAccessIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  quickAccessText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  legislatorItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
});
