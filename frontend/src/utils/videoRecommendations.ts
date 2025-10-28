import { Video } from '../App';

/**
 * Calcula la similitud entre dos videos basándose en diferentes criterios
 * y devuelve una puntuación de similitud.
 */
export function calculateSimilarity(video1: Video, video2: Video): number {
    let score = 0;

    // 1. Mismo autor (peso: 3 puntos)
    if (video1.user.toLowerCase() === video2.user.toLowerCase()) {
        score += 3;
    }

    // 2. Categorías en común (peso: 2 puntos por categoría)
    const categories1 = video1.meta?.categories || [];
    const categories2 = video2.meta?.categories || [];
    const commonCategories = categories1.filter(cat =>
        categories2.some(cat2 => cat2.toLowerCase() === cat.toLowerCase())
    );
    score += commonCategories.length * 2;

    // 3. Palabras significativas en común en el título (peso: 1 punto por palabra)
    const significantWords = getSignificantWords(video1.title, video2.title);
    score += significantWords.length;

    // 4. Tags en común (peso: 1 punto por tag)
    const tags1 = video1.meta?.tags || [];
    const tags2 = video2.meta?.tags || [];
    const commonTags = tags1.filter(tag =>
        tags2.some(tag2 => tag2.toLowerCase() === tag.toLowerCase())
    );
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
        'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
        'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para',
        'y', 'o', 'pero', 'si', 'no', 'que', 'como', 'su',
        'sus', 'se', 'le', 'lo', 'me', 'mi', 'mis', 'tu',
        'tus', 'te', 'este', 'esta', 'estos', 'estas',
        'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
        'aquellos', 'aquellas', 'es', 'son', 'he', 'ha',
        'hemos', 'han', 'ser', 'estar', 'tener', 'hacer'
    ]);

    // Normalizar y dividir en palabras
    const words1 = title1.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    const words2 = title2.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Encontrar palabras en común
    const commonWords = words1.filter(word => words2.includes(word));

    return [...new Set(commonWords)]; // Eliminar duplicados
}

/**
 * Obtiene los videos más relacionados con un video dado.
 * @param currentVideo El video actual
 * @param allVideos Todos los videos disponibles
 * @param maxResults Número máximo de videos relacionados a devolver (por defecto 15)
 * @returns Array de videos ordenados por relevancia
 */
export function getRelatedVideos(
    currentVideo: Video,
    allVideos: Video[],
    maxResults: number = 15
): Video[] {
    // Filtrar el video actual
    const otherVideos = allVideos.filter(v => v.id !== currentVideo.id);

    // Calcular puntuación de similitud para cada video
    const videosWithScore = otherVideos.map(video => ({
        video,
        score: calculateSimilarity(currentVideo, video)
    }));

    // Ordenar por puntuación (descendente) y luego por título (alfabéticamente)
    videosWithScore.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.video.title.localeCompare(b.video.title, 'es', { sensitivity: 'base' });
    });

    // Devolver solo los videos (sin la puntuación) limitados al máximo
    return videosWithScore.slice(0, maxResults).map(item => item.video);
}

/**
 * Agrupa los videos relacionados por categorías comunes con el video actual.
 * @param currentVideo El video actual
 * @param relatedVideos Los videos relacionados ya filtrados
 * @returns Un mapa de categorías a videos
 */
export function groupRelatedVideosByCategory(
    currentVideo: Video,
    relatedVideos: Video[]
): Map<string, Video[]> {
    const grouped = new Map<string, Video[]>();
    const currentCategories = currentVideo.meta?.categories || [];

    // Agregar videos según las categorías del video actual
    currentCategories.forEach(category => {
        const videosInCategory = relatedVideos.filter(video =>
            video.meta?.categories?.includes(category)
        );
        if (videosInCategory.length > 0) {
            grouped.set(category, videosInCategory);
        }
    });

    // Agregar videos del mismo autor si existen
    const sameAuthorVideos = relatedVideos.filter(video =>
        video.user.toLowerCase() === currentVideo.user.toLowerCase()
    );
    if (sameAuthorVideos.length > 0) {
        grouped.set(`Más de ${currentVideo.user}`, sameAuthorVideos);
    }

    return grouped;
}
