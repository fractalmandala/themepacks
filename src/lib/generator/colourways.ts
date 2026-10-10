export interface ColourwayPreset {
	id: string;
	name: string;
	colors: string[];
}

export const COLOURWAY_PRESETS: ColourwayPreset[] = [
	// ─── Warm & Solar Spectrum ───────────────────────────────────────
	{
		id: 'solar',
		name: 'Solar Flare',
		colors: ['#FFE600', '#FF7700', '#FF1E00', '#9B00E8']
	},
	{
		id: 'citrus-punch',
		name: 'Citrus Punch',
		colors: ['#D4FF00', '#FFEA00', '#FF7A00', '#FF0055']
	},
	{
		id: 'sunset-blvd',
		name: 'Sunset Blvd',
		colors: ['#FF5E7E', '#FF9966', '#FF5E36', '#6C00FF']
	},
	{
		id: 'heatwave',
		name: 'Heatwave',
		colors: ['#FFF066', '#FF9F1C', '#E71D36', '#7209B7']
	},

	// ─── Greens & Bioluminescent ─────────────────────────────────────
	{
		id: 'acid-lime',
		name: 'Acid Lime',
		colors: ['#CCFF00', '#70E000', '#00DF89', '#003820']
	},
	{
		id: 'botanic-pop',
		name: 'Neon Flora',
		colors: ['#69FF97', '#00E676', '#00B4D8', '#004B49']
	},
	{
		id: 'tropicana',
		name: 'Tropicana',
		colors: ['#00F5D4', '#00BBF9', '#F15BB5', '#FEE440']
	},
	{
		id: 'lagoon',
		name: 'Lagoon',
		colors: ['#00F5D4', '#01BAEF', '#0B4F6C', '#011936']
	},

	// ─── Cyans, Cobalts & Electrics ──────────────────────────────────
	{
		id: 'laser-blue',
		name: 'Laser Cobalt',
		colors: ['#64DFDF', '#48CAE4', '#0077B6', '#023E8A']
	},
	{
		id: 'cyber-neon',
		name: 'Cyber Neon',
		colors: ['#00F0FF', '#FF007F', '#FFE600', '#7B2CBF']
	},
	{
		id: 'synthwave',
		name: 'Synthwave',
		colors: ['#F72585', '#7209B7', '#3A0CA3', '#4CC9F0']
	},
	{
		id: 'ultraviolet',
		name: 'Ultraviolet',
		colors: ['#E0AAFF', '#C77DFF', '#9D4EDD', '#3C096C']
	},

	// ─── Magentas, Corals & Pop Culture ──────────────────────────────
	{
		id: 'bubblegum',
		name: 'Bubblegum',
		colors: ['#FF99C8', '#FC4482', '#FF0055', '#790049']
	},
	{
		id: 'tokyo-pop',
		name: 'Tokyo Pop',
		colors: ['#FF006E', '#8338EC', '#3A86FF', '#FB5607']
	},
	{
		id: 'coral-fire',
		name: 'Coral Glow',
		colors: ['#FF6B6B', '#FF8E53', '#FFAA64', '#C4004F']
	},
	{
		id: 'prism',
		name: 'Chroma Prism',
		colors: ['#FF0055', '#FF7700', '#FFE600', '#00E676', '#00C2FF', '#8338EC']
	}
];
