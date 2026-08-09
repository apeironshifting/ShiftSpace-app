import { Script, SODetails, Pet, Place, Person, Block, Page } from '@/hooks/use-scripts';
import { ThemeId } from '@/hooks/use-theme';

export const defaultPerson: Person = {
  id: '',
  name: 'script_page.insert_person_name',
  pronouns: '',
  nickname: '',
  relationship: '',
  content: [{ id: 'block-initial', type: 'text', content: '' }],
};

export const defaultPet: Pet = {
    id: '',
    name: 'script_page.insert_animal_species',
    sex: '',
    species: '',
    age: '',
    size: '',
    personality: '',
    extras: '',
};


export const defaultPossession = {
  id: '',
  name: 'script_page.insert_object_name',
  description: [],
}

export const defaultOptionalSection = {
  id: `section-${Date.now()}`,
  title: 'defaults.new_section',
  blocks: [{ id: `block-${Date.now()}`, type: 'text', content: '' }],
}

export const defaultSODetails: SODetails = {
    id: 'so-initial',
    name: '',
    age: '',
    birthday: '',
    birthplace: '',
    species: '',
    pronouns: '',
    sex: '',
    gender: '',
    sexuality: '',
    height: '',
    are_we_together: '',
    relationship_dynamic: '',
    nicknames: '',
    backstory: [],
    personality: [],
    our_story: [],
    physical_appearance: [],
    extra_content: [],
}

export const defaultPlace: Place = {
  id: `place-${Date.now()}`,
  name: 'defaults.new_page',
  description: [],
  coverImage: '',
  coverImageHint: '',
  themeId: undefined,
}

export const defaultPage: Page = {
  id: `page-${Date.now()}`,
  name: 'defaults.new_page',
  description: [],
  coverImage: '',
  coverImageHint: '',
  themeId: undefined,
}

export const defaultScriptTemplate: Omit<Script, 'id' | 'title' | 'userId'> = {
  isTemplate: false,
  isEmpty: false,
  isPublic: false,
  isFavorite: false,
  coverImage: '',
  coverImageHint: '',
  playlistUrl: '',
  themeId: undefined,
  imageAfterMe: null,
  imageAfterRelationships: null,
  imageAfterMyLife: null,
  imageAfterLive: null,
  imageAfterDefinitions: null,
  imageAfterEnd: null,
  details: {
    about: {
        name: '',
        nickname: '',
        pronouns: '',
        sex: '',
        gender: '',
        age: '',
        birthday: '',
        birthplace: '',
        height: '',
        sexuality: '',
        smell: '',
        species: '',
    },
    backstory: [],
    physical_appearance: [],
  },
  relationships: {
    friends: [],
    family: [],
    so: defaultSODetails,
  },
  my_life: {
    possessions: [],
    pets: [],
    aesthetic: [],
  },
  liveDescription: [
    {
      id: `block-places_grid-${Date.now()}`,
      type: 'places_grid',
      content: [],
    }
  ],
  places: [],
  definitions: [],
  optionalSections: [],
  extraContent: [],
};

const wrLiveDescription: Block[] = [
    { id: 'wr-initial-1', type: 'h1', content: 'defaults.safeword' },
    { id: 'wr-initial-2', type: 'text', content: 'defaults.safeword' },
    { id: 'wr-initial-3', type: 'h1', content: 'defaults.rules' },
    { id: 'wr-initial-4', type: 'text', content: 'defaults.rules' }
];


export const wrScriptTemplate: Omit<Script, 'id' | 'title' | 'userId'> = {
    isTemplate: true,
    isEmpty: true,
    isPublic: false,
    isFavorite: false,
    coverImage: '',
    coverImageHint: '',
    playlistUrl: '',
    themeId: undefined,
    imageAfterMe: null,
    imageAfterRelationships: null,
    imageAfterMyLife: null,
    imageAfterLive: null,
    imageAfterDefinitions: null,
    imageAfterEnd: null,
    details: {
        about: {
            name: '',
            nickname: '',
            pronouns: '',
            sex: '',
            gender: '',
            age: '',
            birthday: '',
            birthplace: '',
            height: '',
            sexuality: '',
            smell: '',
            species: '',
        },
        backstory: [],
        physical_appearance: [],
    },
    relationships: {
        friends: [],
        family: [],
        so: { ...defaultSODetails },
    },
    my_life: {
        possessions: [],
        pets: [],
        aesthetic: [],
    },
    liveDescription: [],
    places: [],
    definitions: [],
    optionalSections: [],
    extraContent: wrLiveDescription,
};


export const emptyScriptTemplate: Omit<Script, 'id' | 'title' | 'userId'> = {
  isTemplate: false,
  isEmpty: true,
  isPublic: false,
  isFavorite: false,
  coverImage: '',
  coverImageHint: '',
  playlistUrl: '',
  themeId: undefined,
  imageAfterMe: null,
  imageAfterRelationships: null,
  imageAfterMyLife: null,
  imageAfterLive: null,
  imageAfterDefinitions: null,
  imageAfterEnd: null,
  details: {
    about: {
        name: '',
        nickname: '',
        pronouns: '',
        sex: '',
        gender: '',
        age: '',
        birthday: '',
        birthplace: '',
        height: '',
        sexuality: '',
        smell: '',
        species: '',
    },
    backstory: [],
    physical_appearance: [],
  },
  relationships: {
    friends: [],
    family: [],
    so: defaultSODetails,
  },
  my_life: {
    possessions: [],
    pets: [],
    aesthetic: [],
  },
  liveDescription: [],
  places: [],
  definitions: [],
  optionalSections: [],
  extraContent: [],
};


// This is now just for initial hydration if localStorage is empty
export const initialScriptsForHydration: Script[] = [];
