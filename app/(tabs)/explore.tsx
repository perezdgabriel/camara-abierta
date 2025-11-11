import { useState, useEffect } from "react";
import { StyleSheet, ActivityIndicator } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CongressAPI from "@/services/CongressAPIService";

export default function ExploreScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await CongressAPI.getRequestStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          Cargando estadísticas...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#4A90E2", dark: "#1D3D47" }}
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
        <ThemedText type="title">📊 Estadísticas</ThemedText>
      </ThemedView>

      <ThemedText>Uso de la API del Congreso Nacional</ThemedText>

      {/* Estadísticas */}
      {stats && (
        <>
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">📈 Solicitudes Realizadas</ThemedText>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>
                {stats.total_requests || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                Total de Solicitudes
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">✅ Solicitudes Exitosas</ThemedText>
            <ThemedView style={styles.statCard}>
              <ThemedText style={styles.statNumber}>
                {stats.successful_requests || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Respuestas OK</ThemedText>
            </ThemedView>
          </ThemedView>

          {stats.failed_requests > 0 && (
            <ThemedView style={styles.stepContainer}>
              <ThemedText type="subtitle">❌ Solicitudes Fallidas</ThemedText>
              <ThemedView style={styles.statCard}>
                <ThemedText style={styles.statNumber}>
                  {stats.failed_requests}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Errores</ThemedText>
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">🔍 Detalles por Endpoint</ThemedText>
            {stats.endpoints && Object.keys(stats.endpoints).length > 0 ? (
              Object.entries(stats.endpoints).map(
                ([endpoint, count]: [string, any]) => (
                  <ThemedView key={endpoint} style={styles.endpointItem}>
                    <ThemedText style={styles.endpointName}>
                      {endpoint.split("/").pop() || endpoint}
                    </ThemedText>
                    <ThemedText style={styles.endpointCount}>
                      {count} peticiones
                    </ThemedText>
                  </ThemedView>
                )
              )
            ) : (
              <ThemedText>No hay datos de endpoints</ThemedText>
            )}
          </ThemedView>
        </>
      )}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">ℹ️ Sobre esta App</ThemedText>
        <ThemedText>
          Esta aplicación consume la API de Datos Abiertos del Congreso Nacional
          de Chile para mostrar información actualizada sobre legisladores,
          votaciones y comisiones.
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
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  statNumber: {
    fontSize: 48,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 16,
    marginTop: 8,
  },
  endpointItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
  },
  endpointName: {
    flex: 1,
    fontSize: 14,
  },
  endpointCount: {
    fontSize: 14,
    fontWeight: "600",
  },
});
