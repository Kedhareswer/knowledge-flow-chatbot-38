// ImageNet 1000 classes (used by MobileNet and EfficientNet)
export const IMAGENET_CLASSES = [
  "tench",
  "goldfish",
  "great white shark",
  "tiger shark",
  "hammerhead shark",
  "electric ray",
  "stingray",
  "rooster",
  "hen",
  "ostrich",
  "brambling",
  "goldfinch",
  "house finch",
  "junco",
  "indigo bunting",
  // ... (truncated for brevity - in a real implementation, this would include all 1000 classes)
  // The first 20 classes are shown as an example
  "bulbul",
  "jay",
  "magpie",
  "chickadee",
  "water ouzel",
  "kite",
  "bald eagle",
  "vulture",
  "great grey owl",
  "fire salamander",
  "smooth newt",
  "newt",
  "spotted salamander",
  "axolotl",
  "bullfrog",
  "tree frog",
  "tailed frog",
  "loggerhead turtle",
  "leatherback turtle",
  "mud turtle",
  // ... (remaining classes would be listed here)
]

// ImageNet superclasses (simplified grouping for display purposes)
export const IMAGENET_SUPERCLASSES = [
  "fish",
  "birds",
  "amphibians",
  "reptiles",
  "mammals",
  "invertebrates",
  "vehicles",
  "household items",
  "food",
  "plants",
  "structures",
  "natural objects",
  "sports equipment",
  "clothing",
  "instruments",
  "tools",
  "electronics",
  "containers",
  "furniture",
  "miscellaneous",
]

// Mapping from class index to superclass index (simplified for demonstration)
export function getImageNetSuperclass(classIndex: number): string {
  // This is a simplified mapping - in a real implementation,
  // you would have a more accurate mapping of the 1000 ImageNet classes to superclasses
  const superclassIndex = Math.floor(classIndex / 50) % IMAGENET_SUPERCLASSES.length
  return IMAGENET_SUPERCLASSES[superclassIndex]
}
