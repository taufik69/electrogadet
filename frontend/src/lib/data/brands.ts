import type { IconType } from "react-icons"
import {
  SiApple,
  SiSamsung,
  SiSony,
  SiXiaomi,
  SiBose,
  SiJbl,
  SiAsus,
  SiLenovo,
} from "react-icons/si"

export interface BrandProduct {
  name: string
  slug: string
}

export interface BrandCategory {
  name: string
  slug: string
  products: BrandProduct[]
}

export interface Brand {
  /** Display name in the text column, e.g. "Apple products" */
  name: string
  slug: string
  /** Brand mark shown in the icon rail (Simple Icons — lucide has no brand logos) */
  icon: IconType
  categories: BrandCategory[]
}

export const brands: Brand[] = [
  {
    name: "Apple products",
    slug: "apple",
    icon: SiApple,
    categories: [
      {
        name: "Apple iPad",
        slug: "ipad",
        products: [
          { name: 'iPad Pro 13" M5 (2025)', slug: "ipad-pro-13-m5-2025" },
          { name: 'iPad Air 11" (2025)', slug: "ipad-air-11-2025" },
          { name: 'iPad Air 13" (2025)', slug: "ipad-air-13-2025" },
          { name: "iPad mini (2024)", slug: "ipad-mini-2024" },
        ],
      },
      {
        name: "Apple MacBook",
        slug: "macbook",
        products: [
          { name: 'MacBook Pro 14" M5', slug: "macbook-pro-14-m5" },
          { name: 'MacBook Pro 16" M5', slug: "macbook-pro-16-m5" },
          { name: 'MacBook Air 13" M4', slug: "macbook-air-13-m4" },
        ],
      },
      {
        name: "Apple Watch",
        slug: "watch",
        products: [
          { name: "Apple Watch Series 11", slug: "watch-series-11" },
          { name: "Apple Watch Ultra 3", slug: "watch-ultra-3" },
          { name: "Apple Watch SE", slug: "watch-se" },
        ],
      },
      {
        name: "Apple iPhone",
        slug: "iphone",
        products: [
          { name: "iPhone 17 Pro Max", slug: "iphone-17-pro-max" },
          { name: "iPhone 17 Pro", slug: "iphone-17-pro" },
          { name: "iPhone 17", slug: "iphone-17" },
        ],
      },
      {
        name: "Apple accessories",
        slug: "accessories",
        products: [
          { name: "AirPods Pro 3", slug: "airpods-pro-3" },
          { name: "Magic Keyboard", slug: "magic-keyboard" },
          { name: "Apple Pencil Pro", slug: "apple-pencil-pro" },
        ],
      },
    ],
  },
  {
    name: "Samsung products",
    slug: "samsung",
    icon: SiSamsung,
    categories: [
      {
        name: "Samsung tablets",
        slug: "tablets",
        products: [
          { name: "Galaxy Tab S11", slug: "galaxy-tab-s11" },
          { name: "Galaxy Tab S10 Ultra", slug: "galaxy-tab-s10-ultra" },
          { name: "Galaxy Tab S10+", slug: "galaxy-tab-s10-plus" },
          { name: "Galaxy Tab A9+", slug: "galaxy-tab-a9-plus" },
        ],
      },
      {
        name: "Samsung phones",
        slug: "phones",
        products: [
          { name: "Galaxy S25 Ultra", slug: "galaxy-s25-ultra" },
          { name: "Galaxy S25+", slug: "galaxy-s25-plus" },
          { name: "Galaxy Z Fold 7", slug: "galaxy-z-fold-7" },
        ],
      },
      {
        name: "Samsung watches",
        slug: "watches",
        products: [
          { name: "Galaxy Watch 8", slug: "galaxy-watch-8" },
          { name: "Galaxy Watch Ultra", slug: "galaxy-watch-ultra" },
        ],
      },
      {
        name: "Samsung headphones",
        slug: "headphones",
        products: [
          { name: "Galaxy Buds 4 Pro", slug: "galaxy-buds-4-pro" },
          { name: "Galaxy Buds 4", slug: "galaxy-buds-4" },
        ],
      },
    ],
  },
  {
    name: "Sony products",
    slug: "sony",
    icon: SiSony,
    categories: [
      {
        name: "Sony headphones",
        slug: "headphones",
        products: [
          { name: "WH-1000XM6", slug: "wh-1000xm6" },
          { name: "WF-1000XM5", slug: "wf-1000xm5" },
          { name: "ULT Wear", slug: "ult-wear" },
        ],
      },
      {
        name: "Sony cameras",
        slug: "cameras",
        products: [
          { name: "Alpha 7 V", slug: "alpha-7-v" },
          { name: "Alpha 6700", slug: "alpha-6700" },
        ],
      },
    ],
  },
  {
    name: "Xiaomi products",
    slug: "xiaomi",
    icon: SiXiaomi,
    categories: [
      {
        name: "Xiaomi phones",
        slug: "phones",
        products: [
          { name: "Xiaomi 15 Ultra", slug: "xiaomi-15-ultra" },
          { name: "Redmi Note 14 Pro", slug: "redmi-note-14-pro" },
        ],
      },
      {
        name: "Xiaomi vacuums",
        slug: "vacuums",
        products: [
          { name: "Robot Vacuum X20", slug: "robot-vacuum-x20" },
          { name: "Vacuum G11", slug: "vacuum-g11" },
        ],
      },
      {
        name: "Xiaomi wearables",
        slug: "wearables",
        products: [
          { name: "Smart Band 10", slug: "smart-band-10" },
          { name: "Watch S4", slug: "watch-s4" },
        ],
      },
    ],
  },
  {
    name: "Bose products",
    slug: "bose",
    icon: SiBose,
    categories: [
      {
        name: "Bose headphones",
        slug: "headphones",
        products: [
          { name: "QuietComfort Ultra", slug: "quietcomfort-ultra" },
          { name: "QuietComfort Earbuds", slug: "quietcomfort-earbuds" },
        ],
      },
      {
        name: "Bose speakers",
        slug: "speakers",
        products: [
          { name: "SoundLink Max", slug: "soundlink-max" },
          { name: "Home Speaker 500", slug: "home-speaker-500" },
        ],
      },
    ],
  },
  {
    name: "JBL products",
    slug: "jbl",
    icon: SiJbl,
    categories: [
      {
        name: "JBL speakers",
        slug: "speakers",
        products: [
          { name: "Charge 6", slug: "charge-6" },
          { name: "Flip 7", slug: "flip-7" },
          { name: "Boombox 4", slug: "boombox-4" },
        ],
      },
      {
        name: "JBL headphones",
        slug: "headphones",
        products: [
          { name: "Tour One M3", slug: "tour-one-m3" },
          { name: "Live 770NC", slug: "live-770nc" },
        ],
      },
    ],
  },
  {
    name: "Asus products",
    slug: "asus",
    icon: SiAsus,
    categories: [
      {
        name: "Asus laptops",
        slug: "laptops",
        products: [
          { name: "ROG Zephyrus G16", slug: "rog-zephyrus-g16" },
          { name: "Zenbook 14 OLED", slug: "zenbook-14-oled" },
        ],
      },
      {
        name: "Asus monitors",
        slug: "monitors",
        products: [
          { name: "ProArt PA32UCE", slug: "proart-pa32uce" },
          { name: "ROG Swift OLED", slug: "rog-swift-oled" },
        ],
      },
    ],
  },
  {
    name: "Lenovo products",
    slug: "lenovo",
    icon: SiLenovo,
    categories: [
      {
        name: "Lenovo laptops",
        slug: "laptops",
        products: [
          { name: "ThinkPad X1 Carbon", slug: "thinkpad-x1-carbon" },
          { name: "Yoga Slim 7i", slug: "yoga-slim-7i" },
          { name: "Legion Pro 7i", slug: "legion-pro-7i" },
        ],
      },
      {
        name: "Lenovo tablets",
        slug: "tablets",
        products: [{ name: "Tab P12 Pro", slug: "tab-p12-pro" }],
      },
    ],
  },
]
