import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetCopa2026Scores } from "@workspace/api-client-react";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MatchCard from "@/components/MatchCard";
import { useColors } from "@/hooks/useColors";

type Colors = ReturnType<typeof useColors>;

const GROUPS = ["Todos", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function ScoreboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedGroup, setSelectedGroup] = useState<string>("Todos");

  const { data, isLoading, isError, refetch, isFetching } = useGetCopa2026Scores({
    query: {
      refetchInterval: (query: any) => {
        const matches = query.state.data?.matches;
        const hasLive = Array.isArray(matches) && matches.some((m: any) => m.status === "LIVE");
        return hasLive ? 10_000 : 30_000;
      },
    } as any,
  });

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const matches = data?.matches ?? [];
  const filteredMatches =
    selectedGroup === "Todos"
      ? matches
      : matches.filter((m) => m.group === selectedGroup);

  const liveCount = matches.filter((m) => m.status === "LIVE").length;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const s = makeStyles(colors);

  if (isLoading) {
    return (
      <View style={[s.fullCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Carregando placares...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[s.fullCenter, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="wifi-off" size={48} color={colors.mutedForeground} />
        <Text style={s.errorText}>Falha ao carregar placares</Text>
        <TouchableOpacity style={s.retryButton} onPress={() => refetch()} activeOpacity={0.7}>
          <Text style={s.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View style={[s.header, { paddingTop: topInset + 12 }]}>
        <View style={s.headerLeft}>
          <MaterialCommunityIcons name="trophy" size={22} color={colors.primary} />
          <Text style={s.headerTitle}>COPA 2026</Text>
        </View>
        <View style={s.headerRight}>
          {liveCount > 0 && (
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveBadgeText}>{liveCount} AO VIVO</Text>
            </View>
          )}
          {data?.source != null && (
            <View
              style={[
                s.sourcePill,
                {
                  backgroundColor:
                    data.source === "live" ? "#22c55e22" : "#6b728022",
                },
              ]}
            >
              <Text
                style={[
                  s.sourceText,
                  {
                    color:
                      data.source === "live"
                        ? colors.finished
                        : colors.mutedForeground,
                  },
                ]}
              >
                {data.source === "live"
                  ? "LIVE API"
                  : data.source === "cache"
                    ? "CACHE"
                    : "STATIC"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={s.filterContent}
      >
        {GROUPS.map((group) => {
          const isActive = selectedGroup === group;
          return (
            <TouchableOpacity
              key={group}
              style={[s.filterPill, isActive && s.filterPillActive]}
              onPress={() => setSelectedGroup(group)}
              activeOpacity={0.7}
              testID={`filter-${group}`}
            >
              <Text style={[s.filterPillText, isActive && s.filterPillTextActive]}>
                {group === "Todos" ? "Todos" : `Grupo ${group}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchCard match={item} />}
        contentContainerStyle={[
          s.listContent,
          { paddingBottom: bottomInset + 12 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        scrollEnabled={!!filteredMatches.length}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <MaterialCommunityIcons
              name="soccer"
              size={40}
              color={colors.mutedForeground}
            />
            <Text style={s.emptyText}>Nenhuma partida encontrada</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {data?.updatedAt != null && (
        <View style={[s.footer, { paddingBottom: bottomInset > 0 ? bottomInset : 8 }]}>
          <Text style={s.footerText}>
            Atualizado às{" "}
            {new Date(data.updatedAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    fullCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    headerTitle: {
      color: colors.primary,
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      letterSpacing: 1.5,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    liveBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "#ef444422",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.live,
    },
    liveBadgeText: {
      color: colors.live,
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      letterSpacing: 0.5,
    },
    sourcePill: {
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 12,
    },
    sourceText: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 0.5,
    },
    filterBar: {
      flexGrow: 0,
      paddingVertical: 10,
    },
    filterContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "transparent",
    },
    filterPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterPillText: {
      color: colors.mutedForeground,
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    filterPillTextActive: {
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
    },
    listContent: {
      paddingHorizontal: 12,
      paddingTop: 4,
      gap: 10,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 12,
    },
    emptyText: {
      color: colors.mutedForeground,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
    },
    loadingText: {
      color: colors.mutedForeground,
      fontSize: 15,
      fontFamily: "Inter_400Regular",
    },
    errorText: {
      color: colors.foreground,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
    },
    retryText: {
      color: colors.primaryForeground,
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    footer: {
      alignItems: "center",
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      color: colors.mutedForeground,
      fontSize: 11,
      fontFamily: "Inter_400Regular",
    },
  });
}
