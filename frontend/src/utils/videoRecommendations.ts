import { Video } from '../App';

/**
 * Diccionario de palabras relacionadas semánticamente.
 * Agrupa palabras por temáticas para mejorar las recomendaciones.
 */
const SEMANTIC_GROUPS: { [key: string]: string[] } = {
  // Cocina y comida
  cocina: [
    'cooking',
    'receta',
    'recetas',
    'recipe',
    'recipes',
    'roasts',
    'roast',
    'roasting',
    'comida',
    'comidas',
    'food',
    'cena',
    'cenas',
    'dinner',
    'dinners',
    'almuerzo',
    'almuerzos',
    'lunch',
    'desayuno',
    'desayunos',
    'breakfast',
    'chef',
    'gastronomia',
    'gastronomy',
    'plato',
    'platos',
    'dish',
    'dishes',
    'preparar',
    'prepare',
    'cocinar',
    'cook',
    'cocinando',
    'hornear',
    'bake',
    'baking',
    'freir',
    'fry',
    'frying',
    'hervir',
    'boil',
    'boiling',
    'asar',
    'grill',
    'grilling',
    'mezclar',
    'mix',
    'mixing',
    'ingrediente',
    'ingredientes',
    'ingredient',
    'ingredients',
    'rapido',
    'rapida',
    'rapidos',
    'rapidas',
    'quick',
    'fast',
    'facil',
    'faciles',
    'easy',
    'minutos',
    'minutes',
    'meal',
    'meals',
    'carne',
    'meats',
    'pollo',
    'chicken',
    'pavo',
    'turkey',
    'cerdo',
    'pork',
    'ternera',
    'beef',
    'pescado',
    'fish',
    'marisco',
    'seafood',
    'vegetales',
    'vegetables',
    'verduras',
    'ensalada',
    'salad',
    'sopa',
    'soup',
    'guiso',
    'stew',
    'pasta',
    'arroz',
    'rice',
    'pan',
    'bread',
    'postre',
    'dessert',
    'dulce',
    'sweet',
    'salado',
    'savory',
    'picante',
    'spicy',
    'agridulce',
    'leg',
    'pierna',
    'clay',
    'barro',
    'horno',
    'oven',
    'fuego',
    'fire',
    'barbacoa',
    'barbecue',
    'bbq',
    'asado',
  ],

  // Deportes
  deporte: [
    'sport',
    'futbol',
    'football',
    'soccer',
    'basketball',
    'baloncesto',
    'tenis',
    'tennis',
    'natacion',
    'swimming',
    'atletismo',
    'athletics',
    'entrenamiento',
    'training',
    'gimnasio',
    'gym',
    'ejercicio',
    'exercise',
  ],

  // Música
  musica: [
    'music',
    'cancion',
    'song',
    'concierto',
    'concert',
    'banda',
    'band',
    'artista',
    'artist',
    'album',
    'melodia',
    'melody',
    'ritmo',
    'rhythm',
    'instrumento',
    'instrument',
    'guitarra',
    'guitar',
    'piano',
  ],

  // Tecnología
  tecnologia: [
    'technology',
    'tech',
    'software',
    'hardware',
    'programacion',
    'programming',
    'codigo',
    'code',
    'ordenador',
    'computer',
    'movil',
    'mobile',
    'app',
    'aplicacion',
    'internet',
    'web',
    'digital',
  ],

  // Viajes
  viaje: [
    'travel',
    'trip',
    'vacation',
    'vacaciones',
    'turismo',
    'tourism',
    'ciudad',
    'city',
    'pais',
    'country',
    'destino',
    'destination',
    'aventura',
    'adventure',
    'mundo',
    'world',
    'explorar',
    'explore',
  ],

  // Gaming
  gaming: [
    'game',
    'juego',
    'videojuego',
    'videogame',
    'gamer',
    'jugador',
    'player',
    'gameplay',
    'stream',
    'streaming',
    'esports',
    'competitivo',
    'competitive',
  ],

  // Educación
  educacion: [
    'education',
    'tutorial',
    'clase',
    'class',
    'curso',
    'course',
    'aprender',
    'learn',
    'ensenar',
    'teach',
    'leccion',
    'lesson',
    'estudiar',
    'study',
    'explicacion',
    'explanation',
  ],

  // Arte y creatividad
  arte: [
    'art',
    'arte',
    'dibujo',
    'draw',
    'drawing',
    'dibuja',
    'pintura',
    'paint',
    'painting',
    'pintar',
    'diseno',
    'design',
    'creativo',
    'creative',
    'artista',
    'artist',
    'obra',
    'work',
    'ilustracion',
    'illustration',
    'sketch',
    'color',
    'colours',
    'colors',
    'colores',
    'acuarela',
    'watercolor',
    'watercolour',
    'lapiz',
    'pencil',
    'brush',
    'pincel',
    'lienzo',
    'canvas',
    'study',
    'studies',
    'estudio',
    'estudios',
    'principiantes',
    'beginners',
    'beginner',
  ],

  // Entretenimiento
  entretenimiento: [
    'entertainment',
    'diversion',
    'fun',
    'diversión',
    'comedia',
    'comedy',
    'humor',
    'gracioso',
    'funny',
    'risa',
    'laugh',
    'show',
    'espectaculo',
    'spectacle',
  ],

  // Naturaleza
  naturaleza: [
    'nature',
    'natural',
    'animal',
    'animales',
    'animals',
    'planta',
    'plant',
    'bosque',
    'forest',
    'montana',
    'mountain',
    'mar',
    'sea',
    'oceano',
    'ocean',
    'paisaje',
    'landscape',
  ],

  // Moda y belleza
  moda: [
    'fashion',
    'style',
    'estilo',
    'ropa',
    'clothes',
    'outfit',
    'tendencia',
    'trend',
    'belleza',
    'beauty',
    'maquillaje',
    'makeup',
    'pelo',
    'hair',
    'look',
  ],

  // Ciencia
  ciencia: [
    'science',
    'scientific',
    'cientifico',
    'experimento',
    'experiment',
    'investigacion',
    'research',
    'descubrimiento',
    'discovery',
    'teoria',
    'theory',
    'fisica',
    'physics',
    'quimica',
    'chemistry',
    'biologia',
    'biology',
  ],
};

/**
 * Normaliza una palabra (elimina acentos y convierte a minúsculas).
 */
function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Encuentra el grupo semántico al que pertenece una palabra.
 */
function findSemanticGroup(word: string): string | null {
  const normalized = normalizeWord(word);
  for (const [group, words] of Object.entries(SEMANTIC_GROUPS)) {
    if (words.some((w) => normalizeWord(w) === normalized)) {
      return group;
    }
  }
  return null;
}

/**
 * Verifica si dos palabras están relacionadas semánticamente.
 */
function areWordsRelated(word1: string, word2: string): boolean {
  const normalized1 = normalizeWord(word1);
  const normalized2 = normalizeWord(word2);

  // Si son la misma palabra (ignorando acentos)
  if (normalized1 === normalized2) {
    return true;
  }

  // Si pertenecen al mismo grupo semántico
  const group1 = findSemanticGroup(word1);
  const group2 = findSemanticGroup(word2);

  return group1 !== null && group1 === group2;
}

/**
 * Helper to safely get username from Video object
 */
function getUsername(user: string | { username: string } | null | undefined): string {
  if (!user) return '';
  if (typeof user === 'string') return user;
  return user.username || '';
}

/**
 * Calcula la similitud entre dos videos basándose en diferentes criterios
 * y devuelve una puntuación de similitud.
 */
export function calculateSimilarity(video1: Video, video2: Video): number {
  let score = 0;

  const user1 = getUsername(video1.user);
  const user2 = getUsername(video2.user);

  // 1. Mismo autor (peso: 3 puntos)
  if (user1 && user2 && user1.toLowerCase() === user2.toLowerCase()) {
    score += 3;
  }

  // 2. Categorías en común (peso: 2 puntos por categoría)
  const categories1 = video1.categories || [];
  const categories2 = video2.categories || [];
  const commonCategories = categories1.filter((cat) =>
    categories2.some((cat2) => cat2.toLowerCase() === cat.toLowerCase())
  );
  score += commonCategories.length * 2;

  // 3. Palabras significativas en común en el título (peso: 1 punto por palabra)
  const significantWords = getSignificantWords(video1.title, video2.title);
  score += significantWords.length;

  // 4. Tags en común (peso: 1 punto por tag)
  const tags1 = video1.tags || [];
  const tags2 = video2.tags || [];
  const commonTags = tags1.filter((tag) => tags2.some((tag2) => tag2.toLowerCase() === tag.toLowerCase()));
  score += commonTags.length;

  return score;
}

/**
 * Extrae palabras significativas comunes entre dos títulos.
 * Ignora palabras de parada (stop words) en español.
 */
function getSignificantWords(title1: string, title2: string): string[] {
  // Stop words en español
  const stopWords = new Set([
    'el',
    'la',
    'los',
    'las',
    'un',
    'una',
    'unos',
    'unas',
    'de',
    'del',
    'a',
    'al',
    'en',
    'con',
    'por',
    'para',
    'y',
    'o',
    'pero',
    'si',
    'no',
    'que',
    'como',
    'su',
    'sus',
    'se',
    'le',
    'lo',
    'me',
    'mi',
    'mis',
    'tu',
    'tus',
    'te',
    'este',
    'esta',
    'estos',
    'estas',
    'ese',
    'esa',
    'esos',
    'esas',
    'aquel',
    'aquella',
    'aquellos',
    'aquellas',
    'es',
    'son',
    'he',
    'ha',
    'hemos',
    'han',
    'ser',
    'estar',
    'tener',
    'hacer',
  ]);

  // Normalizar y dividir en palabras
  const words1 = title1
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const words2 = title2
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  // Encontrar palabras en común
  const commonWords = words1.filter((word) => words2.includes(word));

  return [...new Set(commonWords)]; // Eliminar duplicados
}

/**
 * Calcula la similitud de títulos entre dos videos.
 * Considera tanto palabras idénticas como palabras relacionadas semánticamente.
 * Retorna una puntuación: palabras idénticas valen 2 puntos, relacionadas valen 1 punto.
 */
export function calculateTitleSimilarity(video1: Video, video2: Video): number {
  // Stop words en español
  const stopWords = new Set([
    'el',
    'la',
    'los',
    'las',
    'un',
    'una',
    'unos',
    'unas',
    'de',
    'del',
    'a',
    'al',
    'en',
    'con',
    'por',
    'para',
    'y',
    'o',
    'pero',
    'si',
    'no',
    'que',
    'como',
    'su',
    'sus',
    'se',
    'le',
    'lo',
    'me',
    'mi',
    'mis',
    'tu',
    'tus',
    'te',
    'este',
    'esta',
    'estos',
    'estas',
    'ese',
    'esa',
    'esos',
    'esas',
    'aquel',
    'aquella',
    'aquellos',
    'aquellas',
    'es',
    'son',
    'he',
    'ha',
    'hemos',
    'han',
    'ser',
    'estar',
    'tener',
    'hacer',
  ]);

  // Normalizar y dividir en palabras
  const words1 = video1.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  const words2 = video2.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  let score = 0;
  const matchedWords2 = new Set<string>();

  // Calcular similitud
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (matchedWords2.has(word2)) continue;

      if (normalizeWord(word1) === normalizeWord(word2)) {
        // Palabra idéntica: 2 puntos
        score += 2;
        matchedWords2.add(word2);
        break;
      } else if (areWordsRelated(word1, word2)) {
        // Palabras relacionadas semánticamente: 1 punto
        score += 1;
        matchedWords2.add(word2);
        break;
      }
    }
  }

  return score;
}

/**
 * Obtiene los videos más relacionados con un video dado.
 * @param currentVideo El video actual
 * @param allVideos Todos los videos disponibles
 * @param maxResults Número máximo de videos relacionados a devolver (por defecto 15)
 * @returns Array de videos ordenados por relevancia
 */
export function getRelatedVideos(currentVideo: Video, allVideos: Video[], maxResults: number = 15): Video[] {
  // Filtrar el video actual
  const otherVideos = allVideos.filter((v) => v.id !== currentVideo.id);

  // Calcular puntuación de similitud para cada video
  const videosWithScore = otherVideos.map((video) => ({
    video,
    score: calculateSimilarity(currentVideo, video),
  }));

  // Ordenar por puntuación (descendente) y luego por título (alfabéticamente)
  videosWithScore.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.video.title.localeCompare(b.video.title, 'es', { sensitivity: 'base' });
  });

  // Devolver solo los videos (sin la puntuación) limitados al máximo
  return videosWithScore.slice(0, maxResults).map((item) => item.video);
}

/**
 * Agrupa los videos relacionados por categorías comunes con el video actual.
 * @param currentVideo El video actual
 * @param relatedVideos Los videos relacionados ya filtrados
 * @returns Un mapa de categorías a videos
 */
export function groupRelatedVideosByCategory(currentVideo: Video, relatedVideos: Video[]): Map<string, Video[]> {
  const grouped = new Map<string, Video[]>();
  const currentCategories = currentVideo.categories || [];

  // Agregar videos según las categorías del video actual
  currentCategories.forEach((category) => {
    const videosInCategory = relatedVideos.filter((video) => video.categories?.includes(category));
    if (videosInCategory.length > 0) {
      grouped.set(category, videosInCategory);
    }
  });

  // Agregar videos del mismo autor si existen
  const currentUser = getUsername(currentVideo.user);
  if (currentUser) {
    const sameAuthorVideos = relatedVideos.filter((video) => {
      const videoUser = getUsername(video.user);
      return videoUser && currentUser && videoUser.toLowerCase() === currentUser.toLowerCase();
    });
    if (sameAuthorVideos.length > 0) {
      grouped.set(`Más de ${currentUser}`, sameAuthorVideos);
    }
  }

  return grouped;
}
