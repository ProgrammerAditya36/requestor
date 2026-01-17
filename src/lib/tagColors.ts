export const tagColors = {
	blue: {
	  bg: 'bg-blue-950',
	  border: 'border-blue-700',
	  text: 'text-blue-100',
	  badge: 'bg-blue-900 text-blue-100',
	  hover: 'hover:bg-blue-900',
	},
	red: {
	  bg: 'bg-red-950',
	  border: 'border-red-700',
	  text: 'text-red-100',
	  badge: 'bg-red-900 text-red-100',
	  hover: 'hover:bg-red-900',
	},
	green: {
	  bg: 'bg-green-950',
	  border: 'border-green-700',
	  text: 'text-green-100',
	  badge: 'bg-green-900 text-green-100',
	  hover: 'hover:bg-green-900',
	},
	purple: {
	  bg: 'bg-purple-950',
	  border: 'border-purple-700',
	  text: 'text-purple-100',
	  badge: 'bg-purple-900 text-purple-100',
	  hover: 'hover:bg-purple-900',
	},
	yellow: {
	  bg: 'bg-yellow-950',
	  border: 'border-yellow-700',
	  text: 'text-yellow-100',
	  badge: 'bg-yellow-900 text-yellow-100',
	  hover: 'hover:bg-yellow-900',
	},
	pink: {
	  bg: 'bg-pink-950',
	  border: 'border-pink-700',
	  text: 'text-pink-100',
	  badge: 'bg-pink-900 text-pink-100',
	  hover: 'hover:bg-pink-900',
	},
  } as const
  
  export type TagColor = keyof typeof tagColors