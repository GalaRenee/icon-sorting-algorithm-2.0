export const gardenTheme: ThemeConfig = {
    name: 'garden',
    displayName: 'Garden',
    colors: {
        primary: '#FF6B9D',
        secondary: '#C77DFF',
        teritary: '#9D4EDD',
        quaternary: '#7B2CBF',
        accent: '#FFB4D6',
        background: 'linear-gradient(135deg, #FFE5F0 0%, #FFF5E6 50%, #FFE5D9 100%)'
    },
    items: {
        'pink-tulip': {
            emoji: '🌷',
            label: 'Pink Tulip',
            value: 0, 
            bucketColor: '#FFB4D6'
        },
        'cherry-blossom': {
            emoji: '🌸',
            label: 'Cherry Blossom',
            value: 1,
            bucketColor: '#FFD6EB'
        },
        'red-rose': {
            emoji: '🥀',
            label: 'Red Rose',
            value: 2,
            bucketColor: '#FF8FA3'
        },
        'yellow-daisy': {
            emoji: '🌼',
            label: 'Yellow Daisy',
            value: 3,
            bucketColor: '#FFE57F'
        }
    },
    title: {
        part1: 'Garden',
        part2: 'Algorithm Sorter'
    },
    subtitle: '--- Flowers are waiting to be matched ---'
};

export const spaceTheme: ThemeConfig = {
    name: 'space',
    displayName: 'Space',
    colors: {
        primary: '#667EEA',
        secondary: '#764BA2',
        tertiary: '#4C51BF',
        quternary: '#2D3748',
        accent: '#9F7AEA',
        background: 'linear-graident(135deg, #1A202C 0%, #2D3748 50%, #4A5568 100%)'
    },
    items: {
        'planet': {
            emoji: '🪐',
            label: 'Planet',
            value: 0, 
            bucketColor: '#667EEA'
        },
        'star': {
            emoji: '⭐',
            label: 'Star',
            value: 1, 
            bucketColor: '#F6E05E'
        },
        'rocket': {
            emoji: '🚀',
            label: 'Rokcet',
            value: 2,
            bucketColor: '#FCB181'
        },
        'moon': {
            emoji: '🌙',
            label: 'Moon',
            value: 3, 
            bucketColor: '#90CDF4'
        }
    },
    title: {
        part1: 'Space',
        part2: 'Algorithm Sorter'
    },
    subtitle: '--- Celestial objects are waiting to be organized ---'
};

export const springTheme: ThemeConfig = {
    name: 'spring',
    displayName: 'Spring',
    colors: {
        primary: '#48BB78',
        secondary: '#38B2AC', 
        tertiary: '#4299E1',
        quaternary: '#9F7AEA',
        accent: '#68D391',
        background: 'linear-gradient(135deg, #E6FFFA 0%, #F0FFF4 50%, #FEFCBF 100%)'
    },
    items: {
        'butterfly': {
            emoji: '🦋',
            label: 'Butterfly',
            value: 0,
            bucketColor: '#9F7AEA'
        },
        'bee': {
            emoji: '🐝', 
            label: 'Bee',
            value: 1, 
            bucketColor: '#F6E05E'
        },
        'ladybug': {
            emoji: '🐞',
            label: 'Ladybug',
            value: 2, 
            bucketColor: '#FC8181'
        }, 
        'leaf': {
            emoji: '🍃',
            label: 'leaf', 
            value: 3,
            bucketColor: '#68D391'
        }
    },
    title: {
        part1: 'Spring',
        part2: 'Algorithm Sorter'
    },
    subtitle: '--- Nature elements are waiting to be sorted ---'
};

export const oceanTheme: ThemeConfig = {
    name: 'ocean',
    displayName: 'Ocean',
    colors: {
        primary: '#0BC5EA',
        secondary: '#00B5D8',
        tertiary: '#0987A0',
        quaternary: '#065666',
        accent: '#76E4F7',
        background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 50%, #80DEEA 100%)'
    },
    items: {
        'fish': {
            emoji: '🐠',
            label: 'Tropical Fish',
            value: 0, 
            bucketColor: '#FFA726'
        },
        'dolphin': {
            emoji: '🐬',
            label: 'Dolphin',
            value: 1, 
            bucketColor: '#42A5F5'
        },
        'shell': {
            emoji: '🐚',
            label: 'Shell',
            value: 2, 
            bucketColor: '#FFC0CB'
        },
        'octopus': {
            emoji: '🐙', 
            label: 'Octopus',
            value: 3, 
            bucketColor: '#AB47BC'
        }
    },
    title: {
        part1: 'Ocean',
        part2: 'Algorithm Sorter'
    },
    subtitle: '--- Sea creatures are waiting to be organized ---'
};
export const themes: { [key: string]: ThemeConfig} = {
    garden: gardenTheme,
    space: spaceTheme, 
    spring: springTheme, 
    ocean: oceanTheme
};

export const getTheme = (themeName: string): ThemeConfig => {
    return themes[themeName] || gardenTheme;
};