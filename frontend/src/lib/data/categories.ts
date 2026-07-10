import type { LucideIcon } from "lucide-react"
import {
  Smartphone,
  Laptop,
  Headphones,
  Speaker,
  Watch,
  Bluetooth,
  BatteryCharging,
  Keyboard,
} from "lucide-react"

export interface CategoryLeaf {
  name: string
  slug: string
}

export interface CategorySubgroup {
  name: string
  slug: string
  items: CategoryLeaf[]
}

export interface Category {
  name: string
  slug: string
  icon: LucideIcon
  subgroups: CategorySubgroup[]
}

export const categories: Category[] = [
  {
    name: "Phones",
    slug: "phones",
    icon: Smartphone,
    subgroups: [
      {
        name: "By brand",
        slug: "by-brand",
        items: [
          { name: "Aster", slug: "aster" },
          { name: "Volt", slug: "volt" },
          { name: "Kessel", slug: "kessel" },
        ],
      },
      {
        name: "By type",
        slug: "by-type",
        items: [
          { name: "Flagship", slug: "flagship" },
          { name: "Mid-range", slug: "mid-range" },
          { name: "Rugged", slug: "rugged" },
        ],
      },
    ],
  },
  {
    name: "Laptops",
    slug: "laptops",
    icon: Laptop,
    subgroups: [
      {
        name: "By use",
        slug: "by-use",
        items: [
          { name: "Ultrabooks", slug: "ultrabooks" },
          { name: "Creator", slug: "creator" },
          { name: "Gaming", slug: "gaming" },
        ],
      },
      {
        name: "By size",
        slug: "by-size",
        items: [
          { name: "13″ and under", slug: "13-and-under" },
          { name: "14– 15″", slug: "14-15" },
          { name: "16″ and up", slug: "16-and-up" },
        ],
      },
    ],
  },
  {
    name: "Headphones",
    slug: "headphones",
    icon: Headphones,
    subgroups: [
      {
        name: "By fit",
        slug: "by-fit",
        items: [
          { name: "Over-ear", slug: "over-ear" },
          { name: "On-ear", slug: "on-ear" },
        ],
      },
      {
        name: "By feature",
        slug: "by-feature",
        items: [
          { name: "Noise cancelling", slug: "noise-cancelling" },
          { name: "Wireless", slug: "wireless" },
          { name: "Studio", slug: "studio" },
        ],
      },
    ],
  },
  {
    name: "Speakers",
    slug: "speakers",
    icon: Speaker,
    subgroups: [
      {
        name: "By use",
        slug: "by-use",
        items: [
          { name: "Portable", slug: "portable" },
          { name: "Home", slug: "home" },
          { name: "Outdoor", slug: "outdoor" },
        ],
      },
    ],
  },
  {
    name: "Wearables",
    slug: "wearables",
    icon: Watch,
    subgroups: [
      {
        name: "By type",
        slug: "by-type",
        items: [
          { name: "Smartwatches", slug: "smartwatches" },
          { name: "Fitness bands", slug: "fitness-bands" },
        ],
      },
    ],
  },
  {
    name: "Earbuds",
    slug: "earbuds",
    icon: Bluetooth,
    subgroups: [
      {
        name: "By feature",
        slug: "by-feature",
        items: [
          { name: "Noise cancelling", slug: "noise-cancelling" },
          { name: "Sport", slug: "sport" },
          { name: "Everyday", slug: "everyday" },
        ],
      },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    icon: BatteryCharging,
    subgroups: [
      {
        name: "Power",
        slug: "power",
        items: [
          { name: "Chargers", slug: "chargers" },
          { name: "Power banks", slug: "power-banks" },
          { name: "Cables", slug: "cables" },
        ],
      },
      {
        name: "Protection",
        slug: "protection",
        items: [
          { name: "Cases", slug: "cases" },
          { name: "Screen protectors", slug: "screen-protectors" },
        ],
      },
    ],
  },
  {
    name: "Keyboards",
    slug: "keyboards",
    icon: Keyboard,
    subgroups: [
      {
        name: "By type",
        slug: "by-type",
        items: [
          { name: "Mechanical", slug: "mechanical" },
          { name: "Compact", slug: "compact" },
          { name: "Wireless", slug: "wireless" },
        ],
      },
    ],
  },
]
