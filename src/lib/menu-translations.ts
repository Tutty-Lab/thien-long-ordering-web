const translations:Record<string,Record<string,string>>={
  "Phở bò tái lăn đặc biệt": {
    "de": "Phở mit gebratenem Rindfleisch",
    "en": "Special stir-fried beef phở"
  },
  "Bò xào tái, nước dùng tủy xương, bánh phở tươi.": {
    "de": "Gebratenes Rindfleisch, Knochenmarkbrühe und frische Reisnudeln.",
    "en": "Stir-fried beef, bone marrow broth and fresh rice noodles."
  },
  "Nem cua bể giòn rụm (2 cuốn)": {
    "de": "Knusprige Krabbenrollen (2 Stück)",
    "en": "Crispy crab rolls (2 rolls)"
  },
  "Nem cua biển chiên giòn, kèm nước chấm.": {
    "de": "Knusprig gebratene Krabbenrollen mit Dip.",
    "en": "Crispy fried crab rolls served with dipping sauce."
  },
  "Bún chả nướng than hoa": {
    "de": "Bún chả vom Holzkohlegrill",
    "en": "Charcoal-grilled bún chả"
  },
  "Chả nướng than, bún tươi và rau thơm.": {
    "de": "Gegrilltes Fleisch, Reisnudeln und frische Kräuter.",
    "en": "Charcoal-grilled meat, rice noodles and fresh herbs."
  },
  "Cơm gà tay cầm Hội An": {
    "de": "Hội-An-Hähnchenreis",
    "en": "Hội An chicken rice"
  },
  "Cơm gà vàng thơm, rau răm và nước sốt.": {
    "de": "Duftender Hähnchenreis mit vietnamesischem Koriander und Sauce.",
    "en": "Fragrant chicken rice with Vietnamese coriander and sauce."
  },
  "Trà sen long nhãn": {
    "de": "Lotustee mit Longan",
    "en": "Lotus tea with longan"
  },
  "Trà ướp sen, long nhãn và hạt sen.": {
    "de": "Lotustee mit Longan und Lotussamen.",
    "en": "Lotus-scented tea with longan and lotus seeds."
  },
  "Chè khúc bạch hạt chia": {
    "de": "Mandelgelee mit Chiasamen",
    "en": "Almond jelly with chia seeds"
  },
  "Khúc bạch, hạnh nhân và hạt chia.": {
    "de": "Mandelgelee, Mandeln und Chiasamen.",
    "en": "Almond jelly, almonds and chia seeds."
  }
};
export function translateMenuText(value:string,language:string){return translations[value]?.[language]??value}
