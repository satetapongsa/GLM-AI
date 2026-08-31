export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "เมื่อสักครู่";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "เมื่อวานนี้";
  }
  if (diffInDays < 7) {
    return `${diffInDays} วันที่แล้ว`;
  }

  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function groupConversationsByDate<T extends { createdAt: string }>(
  items: T[]
): { group: string; items: T[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  const groups: Record<string, T[]> = {
    วันนี้: [],
    เมื่อวาน: [],
    "7 วันที่ผ่านมา": [],
    "30 วันที่ผ่านมา": [],
    เก่ากว่านั้น: [],
  };

  items.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    if (itemDate >= today) {
      groups["วันนี้"].push(item);
    } else if (itemDate >= yesterday) {
      groups["เมื่อวาน"].push(item);
    } else if (itemDate >= last7Days) {
      groups["7 วันที่ผ่านมา"].push(item);
    } else if (itemDate >= last30Days) {
      groups["30 วันที่ผ่านมา"].push(item);
    } else {
      groups["เก่ากว่านั้น"].push(item);
    }
  });

  return Object.entries(groups)
    .filter(([, groupItems]) => groupItems.length > 0)
    .map(([group, groupItems]) => ({ group, items: groupItems }));
}
