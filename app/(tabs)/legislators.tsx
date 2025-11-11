import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import CongressAPI from "@/services/CongressAPIService";

export default function LegislatorsScreen() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [legislators, setLegislators] = useState<any[]>([]);
  const [filteredLegislators, setFilteredLegislators] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadLegislators = async () => {
    try {
      setLoading(true);
      const data = await CongressAPI.getCurrentLegislators();
      setLegislators(data);
      setFilteredLegislators(data);
    } catch (error) {
      console.error("Error cargando legisladores:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterLegislators = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredLegislators(legislators);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = legislators.filter((leg) => {
      const nombre = (leg.Nombre || "").toLowerCase();
      const partido = (leg.Partido?.Nombre || "").toLowerCase();
      const region = (leg.Region?.Nombre || "").toLowerCase();

      return (
        nombre.includes(query) ||
        partido.includes(query) ||
        region.includes(query)
      );
    });

    setFilteredLegislators(filtered);
  }, [searchQuery, legislators]);

  useEffect(() => {
    loadLegislators();
  }, []);

  useEffect(() => {
    filterLegislators();
  }, [filterLegislators]);

  const renderLegislator = ({ item }: { item: any }) => (
    <ThemedView style={styles.card}>
      <ThemedView style={styles.legislatorHeader}>
        <ThemedView style={styles.avatarPlaceholder}>
          <ThemedText style={styles.avatarText}>
            {(item.Diputado.Nombre || "N")[0].toUpperCase()}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.legislatorInfo}>
          <ThemedText type="defaultSemiBold">
            {item.Diputado.Nombre || "Sin nombre"}
          </ThemedText>
          {item.Diputado.Militancias.Militancia.Partido?.Alias && (
            <ThemedView style={styles.chip}>
              <ThemedText style={styles.chipText}>
                {item.Diputado.Militancias.Militancia.Partido.Alias}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>

      {item.Region?.Nombre && (
        <ThemedText style={styles.detail}>
          📍 Región: {item.Region.Nombre}
        </ThemedText>
      )}

      {item.Circunscripcion?.Nombre && (
        <ThemedText style={styles.detail}>
          🗺️ Circunscripción: {item.Circunscripcion.Nombre}
        </ThemedText>
      )}

      {item.Email && (
        <ThemedText style={styles.detail}>✉️ {item.Email}</ThemedText>
      )}
    </ThemedView>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          Cargando legisladores...
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
          name="person.3.fill"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Legisladores</ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar por nombre, partido o región..."
          placeholderTextColor={Colors[colorScheme ?? "light"].tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.searchInput,
            {
              backgroundColor: Colors[colorScheme ?? "light"].background,
              color: Colors[colorScheme ?? "light"].text,
            },
          ]}
        />
      </ThemedView>

      <ThemedText style={styles.statsText}>
        {filteredLegislators.length} de {legislators.length} legisladores
      </ThemedText>

      <FlatList
        data={filteredLegislators}
        renderItem={renderLegislator}
        keyExtractor={(item, index) => `legislator-${index}`}
        scrollEnabled={false}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText>No se encontraron legisladores</ThemedText>
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
  legislatorHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#003DA5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  legislatorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
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
