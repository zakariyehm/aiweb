export type ScanResult = {
  title: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  healthScore: number; // 0..10
  imageUri?: string;
};
