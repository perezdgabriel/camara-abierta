import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import {
  DiputadoPeriodo,
  getCurrentMilitancia,
  getFullName,
  mergeSequentialMilitancias,
} from "@/types";

export default function LegislatorsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(true);
  const [legislators, setLegislators] = useState<DiputadoPeriodo[]>([]);
  const [filteredLegislators, setFilteredLegislators] = useState<
    DiputadoPeriodo[]
  >([]);
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
      const fullName = getFullName(leg.Diputado).toLowerCase();
      const currentParty = getCurrentMilitancia(leg.Diputado);
      const partido = (currentParty?.Partido.Nombre || "").toLowerCase();
      const region = (leg.Region?.Nombre || "").toLowerCase();

      return (
        fullName.includes(query) ||
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

  const renderLegislator = ({ item }: { item: DiputadoPeriodo }) => {
    const { Diputado, Region, Circunscripcion, Email } = item;
    const fullName = getFullName(Diputado);
    const currentParty = getCurrentMilitancia(Diputado);
    const mergedMilitancias = mergeSequentialMilitancias(Diputado.Militancias);

    // Calculate age
    const birthDate = new Date(Diputado.FechaNacimiento);
    const age = Math.floor(
      (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    return (
      <Pressable
        onPress={() => router.push(`/legislator/${Diputado.Id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <ThemedView style={styles.cardContent}>
          <ThemedView style={styles.legislatorHeader}>
            <ThemedView style={styles.avatarPlaceholder}>
              <ThemedText style={styles.avatarText}>
                {Diputado.Nombre[0].toUpperCase()}
                {Diputado.ApellidoPaterno[0].toUpperCase()}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.legislatorInfo}>
              <ThemedText type="defaultSemiBold">{fullName}</ThemedText>
              <ThemedText style={styles.subText}>
                {Diputado.Sexo === "Masculino" ? "👨" : "👩"} {age} años
              </ThemedText>
              {currentParty && (
                <ThemedView style={styles.chipContainer}>
                  <ThemedView style={styles.chip}>
                    <ThemedText style={styles.chipText}>
                      {currentParty.Partido.Alias}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.partyName}>
                    {currentParty.Partido.Nombre}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          {Region?.Nombre && (
            <ThemedText style={styles.detail}>
              📍 Región: {Region.Nombre}
            </ThemedText>
          )}

          {Circunscripcion?.Nombre && (
            <ThemedText style={styles.detail}>
              🗺️ Circunscripción: {Circunscripcion.Nombre}
            </ThemedText>
          )}

          {Email && <ThemedText style={styles.detail}>✉️ {Email}</ThemedText>}

          {mergedMilitancias.length > 1 && (
            <ThemedText style={styles.militanciasInfo}>
              🔄 {mergedMilitancias.length} partidos políticos
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView style={styles.chevronContainer}>
          <IconSymbol name="chevron.right" size={20} color="#999" />
        </ThemedView>
      </Pressable>
    );
  };

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
          placeholderTextColor={
            Colors[(colorScheme ?? "light") as keyof typeof Colors]
              .tabIconDefault
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[
            styles.searchInput,
            {
              backgroundColor:
                Colors[(colorScheme ?? "light") as keyof typeof Colors]
                  .background,
              color:
                Colors[(colorScheme ?? "light") as keyof typeof Colors].text,
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
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.7,
    backgroundColor: "#F5F5F5",
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  chevronContainer: {
    paddingRight: 16,
    justifyContent: "center",
    alignItems: "center",
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
  subText: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  chipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
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
    fontWeight: "600",
    color: "#003DA5",
  },
  partyName: {
    fontSize: 12,
    opacity: 0.7,
  },
  detail: {
    fontSize: 14,
    marginVertical: 2,
    opacity: 0.8,
  },
  militanciasInfo: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
});
