import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import CongressAPI from "@/services/CongressAPIService";
import {
  DiputadoPeriodo,
  getCurrentMilitancia,
  getFullName,
  MergedMilitancia,
  mergeSequentialMilitancias,
} from "@/types";

export default function LegislatorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [legislator, setLegislator] = useState<DiputadoPeriodo | null>(null);

  const loadLegislatorDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CongressAPI.getLegislator(id);
      setLegislator(data);
    } catch (error) {
      console.error("Error loading legislator details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLegislatorDetails();
  }, [loadLegislatorDetails]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    return Math.floor(
      (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          Cargando información del legislador...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!legislator) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>No se encontró información del legislador</ThemedText>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backButtonText}>Volver</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const { Diputado, Region, Circunscripcion, Email } = legislator;
  const fullName = getFullName(Diputado);
  const currentParty = getCurrentMilitancia(Diputado);
  const mergedMilitancias = mergeSequentialMilitancias(Diputado.Militancias);
  const age = calculateAge(Diputado.FechaNacimiento);

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header with back button */}
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <IconSymbol name="chevron.left" size={24} color="#003DA5" />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>

        {/* Profile Section */}
        <ThemedView style={styles.profileSection}>
          <ThemedView style={styles.avatarLarge}>
            <ThemedText style={styles.avatarLargeText}>
              {Diputado.Nombre[0].toUpperCase()}
              {Diputado.ApellidoPaterno[0].toUpperCase()}
            </ThemedText>
          </ThemedView>
          <ThemedText type="title" style={styles.nameTitle}>
            {fullName}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Diputado de la República de Chile
          </ThemedText>
        </ThemedView>

        {/* Basic Information Card */}
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Información Personal
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Edad:</ThemedText>
            <ThemedText style={styles.infoValue}>
              {age} años ({Diputado.Sexo === "Masculino" ? "👨" : "👩"}{" "}
              {Diputado.Sexo})
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>
              Fecha de Nacimiento:
            </ThemedText>
            <ThemedText style={styles.infoValue}>
              {formatDate(Diputado.FechaNacimiento)}
            </ThemedText>
          </View>
          {Diputado.RUT && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>RUT:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {Diputado.RUT}-{Diputado.RUTDV}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Current Party Card */}
        {currentParty && (
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Militancia Actual
            </ThemedText>
            <View style={styles.partyCard}>
              <View style={styles.partyBadge}>
                <ThemedText style={styles.partyBadgeText}>
                  {currentParty.Partido.Alias}
                </ThemedText>
              </View>
              <ThemedText style={styles.partyFullName}>
                {currentParty.Partido.Nombre}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Desde:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(currentParty.FechaInicio)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Hasta:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(currentParty.FechaTermino)}
              </ThemedText>
            </View>
          </ThemedView>
        )}

        {/* Electoral Information Card */}
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            Información Electoral
          </ThemedText>
          {Region?.Nombre && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>📍 Región:</ThemedText>
              <ThemedText style={styles.infoValue}>{Region.Nombre}</ThemedText>
            </View>
          )}
          {Circunscripcion?.Nombre && (
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>
                🗺️ Circunscripción:
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {Circunscripcion.Nombre}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Contact Information Card */}
        {Email && (
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Contacto
            </ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>✉️ Email:</ThemedText>
              <ThemedText style={styles.infoValue}>{Email}</ThemedText>
            </View>
          </ThemedView>
        )}

        {/* Party History Card */}
        {mergedMilitancias.length > 0 && (
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Historial de Militancias ({mergedMilitancias.length})
            </ThemedText>
            {mergedMilitancias
              .sort(
                (a, b) =>
                  new Date(b.FechaInicio).getTime() -
                  new Date(a.FechaInicio).getTime()
              )
              .map((militancia: MergedMilitancia, index: number) => {
                // Check if this merged militancia contains the current party
                const isCurrent = currentParty
                  ? militancia.originalMilitancias.some(
                      (m) =>
                        m.Partido.Id === currentParty.Partido.Id &&
                        new Date(currentParty.FechaInicio).getTime() >=
                          new Date(m.FechaInicio).getTime() &&
                        new Date(currentParty.FechaTermino).getTime() <=
                          new Date(m.FechaTermino).getTime()
                    )
                  : false;

                return (
                  <View key={index} style={styles.militanciaItem}>
                    <View style={styles.militanciaHeader}>
                      <View style={styles.partyBadgeSmall}>
                        <ThemedText style={styles.partyBadgeSmallText}>
                          {militancia.Partido.Alias}
                        </ThemedText>
                      </View>
                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <ThemedText style={styles.currentBadgeText}>
                            ACTUAL
                          </ThemedText>
                        </View>
                      )}
                      {militancia.periodCount > 1 && (
                        <View style={styles.periodsBadge}>
                          <ThemedText style={styles.periodsBadgeText}>
                            {militancia.periodCount} períodos
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.militanciaPartyName}>
                      {militancia.Partido.Nombre}
                    </ThemedText>
                    <ThemedText style={styles.militanciaDates}>
                      {formatDate(militancia.FechaInicio)} -{" "}
                      {formatDate(militancia.FechaTermino)}
                    </ThemedText>
                  </View>
                );
              })}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  headerBack: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#003DA5",
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#003DA5",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#003DA5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  nameTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardTitle: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  partyCard: {
    alignItems: "center",
    marginBottom: 16,
  },
  partyBadge: {
    backgroundColor: "#003DA5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  partyBadgeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  partyFullName: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  militanciaItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  militanciaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  partyBadgeSmall: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partyBadgeSmallText: {
    color: "#003DA5",
    fontSize: 14,
    fontWeight: "bold",
  },
  currentBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  periodsBadge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  periodsBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  militanciaPartyName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  militanciaDates: {
    fontSize: 12,
    opacity: 0.7,
  },
});
