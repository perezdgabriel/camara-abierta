import { useState, useEffect } from "react";
import { StyleSheet, FlatList, ActivityIndicator } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CongressAPI from "@/services/CongressAPIService";

export default function CommitteesScreen() {
  const [loading, setLoading] = useState(true);
  const [committees, setCommittees] = useState<any[]>([]);

  useEffect(() => {
    loadCommittees();
  }, []);

  const loadCommittees = async () => {
    try {
      setLoading(true);
      const data = await CongressAPI.getActiveCommittees();
      setCommittees(data);
    } catch (error) {
      console.error("Error cargando comisiones:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCommittee = ({ item }: { item: any }) => (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.icon}>💼</ThemedText>
        <ThemedView style={styles.committeeTitle}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {item.Nombre || "Sin nombre"}
          </ThemedText>
          {item.Tipo && (
            <ThemedView style={styles.chip}>
              <ThemedText style={styles.chipText}>{item.Tipo}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {item.Descripcion && (
        <ThemedText style={styles.description}>{item.Descripcion}</ThemedText>
      )}

      {item.Presidente && (
        <ThemedText style={styles.detail}>
          👤 Presidente: {item.Presidente}
        </ThemedText>
      )}

      {item.NumeroMiembros && (
        <ThemedText style={styles.detail}>
          👥 Miembros: {item.NumeroMiembros}
        </ThemedText>
      )}
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          Cargando comisiones...
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
          name="briefcase.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Comisiones</ThemedText>
      </ThemedView>

      <ThemedText style={styles.statsText}>
        {committees.length} comisiones activas
      </ThemedText>

      <FlatList
        data={committees}
        renderItem={renderCommittee}
        keyExtractor={(item, index) => `committee-${index}`}
        scrollEnabled={false}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No se encontraron comisiones</ThemedText>
          </ThemedView>
        }
      />
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
    marginBottom: 16,
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
  header: {
    flexDirection: "row",
    marginBottom: 10,
  },
  icon: {
    fontSize: 40,
    marginRight: 15,
  },
  committeeTitle: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    marginBottom: 5,
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    opacity: 0.8,
  },
  detail: {
    fontSize: 14,
    marginVertical: 2,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
});
