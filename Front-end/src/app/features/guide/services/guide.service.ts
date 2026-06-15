import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  MOCK_CARE_GUIDES,
  MOCK_GUIDE_FEATURE,
  MOCK_GUIDE_GROUPS,
  MOCK_GUIDE_ITEMS,
  MOCK_GUIDE_TUTORIALS
} from '../data/care-guides.mock';
import type {
  GuideCategoryGroup,
  GuideFeatureItem,
  GuideItem,
  GuideItemGroup,
  GuideTutorialItem,
  PracticalGuide,
  TutorialVideo
} from '../models';

const PRACTICAL_GUIDE_ROUTE_PREFIX = '/guia-pratico';
const PRACTICAL_GUIDE_ROUTES = new Map<string, string>([
  ['banho-de-leito', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/banho-de-leito`],
  ['troca-de-fralda', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/troca-de-fralda`],
  ['higiene-bucal', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/higiene-bucal`],
  ['prevencao-assaduras', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/prevencao-assaduras`],
  ['prevencao-quedas', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/prevencao-quedas`],
  ['alimentacao-assistida', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/alimentacao-assistida`],
  ['controle-de-hidratacao', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/controle-de-hidratacao`],
  ['transferencia-posicionamento', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/transferencia-posicionamento-idoso`],
  ['transferencia-posicionamento-idoso', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/transferencia-posicionamento-idoso`],
  ['independencia-autonomia', `${PRACTICAL_GUIDE_ROUTE_PREFIX}/independencia-autonomia`]
]);

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private http: HttpClient | null = null;

  constructor() {
    try {
      this.http = inject(HttpClient);
    } catch {
      this.http = null;
    }
  }

  // Original synchronous methods for unit tests & backwards compatibility
  getFeaturedGuide(): GuideFeatureItem {
    return MOCK_GUIDE_FEATURE;
  }

  getPracticalGuides(): readonly PracticalGuide[] {
    return MOCK_CARE_GUIDES;
  }

  getGuideGroups(): readonly GuideCategoryGroup[] {
    return MOCK_GUIDE_GROUPS;
  }

  getGuideItemGroups(): readonly GuideItemGroup[] {
    return MOCK_GUIDE_GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      items: group.guides
        .map((guide) => MOCK_GUIDE_ITEMS.find((item) => item.id === guide.id))
        .filter((item): item is GuideItem => item !== undefined)
    }));
  }

  getGuideItems(): readonly GuideItem[] {
    return MOCK_GUIDE_ITEMS;
  }

  getTutorialItems(): readonly GuideTutorialItem[] {
    return MOCK_GUIDE_TUTORIALS;
  }

  getGuideById(id: string): GuideItem | undefined {
    return MOCK_GUIDE_ITEMS.find((item) => item.id === id);
  }

  getPracticalGuideBySlug(slug: string): PracticalGuide | undefined {
    return MOCK_CARE_GUIDES.find((guide) => guide.slug === slug);
  }

  getCareGuideBySlug(slug: string): PracticalGuide | undefined {
    return this.getPracticalGuideBySlug(slug);
  }

  getAvailablePracticalGuideSlugs(): readonly string[] {
    return Array.from(PRACTICAL_GUIDE_ROUTES.keys());
  }

  hasPracticalGuideSlug(slug: string): boolean {
    return PRACTICAL_GUIDE_ROUTES.has(slug);
  }

  hasPracticalGuideRoute(route?: string | null): boolean {
    return this.getPracticalGuideRoute(route) !== null;
  }

  getPracticalGuideRoute(routeOrSlug?: string | null): string | null {
    if (!routeOrSlug) {
      return null;
    }

    const slug = this.extractGuideSlug(routeOrSlug);
    if (!slug || !PRACTICAL_GUIDE_ROUTES.has(slug)) {
      return null;
    }

    return PRACTICAL_GUIDE_ROUTES.get(slug) ?? null;
  }

  getTutorialVideoById(videoId: string): TutorialVideo | undefined {
    return MOCK_CARE_GUIDES.flatMap((guide) => guide.videos ?? []).find((video) => video.id === videoId);
  }

  getTutorialVideoByYoutubeId(youtubeId: string): TutorialVideo | undefined {
    return MOCK_CARE_GUIDES.flatMap((guide) => guide.videos ?? []).find((video) => video.youtubeId === youtubeId);
  }

  // Real backend API methods
  getFeaturedGuideApi(): Observable<GuideFeatureItem> {
    return of({
      id: 'guide-feature-elder-protection',
      link: '/violence',
      title: 'Proteção do Idoso',
      detail: '7 tipos de violência · Sinais de alerta · Canais de denúncia',
      source: 'Fonte: Ministério dos Direitos Humanos e da Cidadania, 2023',
      icon: 'SH',
      badge: 'Material Educativo'
    });
  }

  getGuideItemGroupsApi(): Observable<GuideItemGroup[]> {
    if (!this.http) {
      return of(this.getGuideItemGroups() as GuideItemGroup[]);
    }
    return this.http.get<any>(`${environment.apiUrl}/guides`).pipe(
      map((res) => {
        const items = res.data || [];
        const groupsMap = new Map<string, { id: string; title: string; items: GuideItem[] }>();
        
        items.forEach((item: any) => {
          const groupTitle = item.tag || 'Cuidados';
          const groupId = groupTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
          if (!groupsMap.has(groupId)) {
            groupsMap.set(groupId, {
              id: groupId,
              title: groupTitle,
              items: []
            });
          }
          groupsMap.get(groupId)!.items.push({
            id: item.id,
            slug: item.slug,
            route: `/guia/${item.slug}`,
            title: item.title,
            tag: item.tag,
            detail: item.detail,
            steps: item.steps,
            meta: item.meta,
            icon: item.icon,
            tone: item.tone
          });
        });
        
        return Array.from(groupsMap.values());
      })
    );
  }

  getTutorialItemsApi(): Observable<GuideTutorialItem[]> {
    if (!this.http) {
      return of(this.getTutorialItems() as GuideTutorialItem[]);
    }
    return this.http.get<any>(`${environment.apiUrl}/tutorial-videos`).pipe(
      map((res) => {
        const items = res.data || [];
        return items.map((item: any) => ({
          id: `tutorial-${item.id}`,
          title: item.title,
          category: 'Vídeo Auxiliar',
          detail: item.description,
          link: item.url_externa,
          icon: 'play-outline',
          videoId: item.id,
          youtubeId: item.youtubeId,
          videoUrl: item.externalUrl
        }));
      })
    );
  }

  getPracticalGuideBySlugApi(slug: string): Observable<PracticalGuide> {
    if (!this.http) {
      const guide = this.getPracticalGuideBySlug(slug);
      return guide ? of(guide) : of({} as PracticalGuide);
    }
    return this.http.get<any>(`${environment.apiUrl}/guides/${slug}`).pipe(
      map((res) => {
        const item = res.data;
        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          category: item.category,
          shortDescription: item.shortDescription,
          icon: item.icon,
          tone: item.tone,
          stepsCount: item.stepsCount,
          cardMeta: item.cardMeta,
          hasTips: item.hasTips,
          hasVideo: item.hasVideo,
          status: item.status,
          sections: item.sections || [],
          videos: item.videos || []
        };
      })
    );
  }

  getTutorialVideoByIdApi(videoId: string): Observable<TutorialVideo> {
    if (!this.http) {
      const video = this.getTutorialVideoById(videoId);
      return video ? of(video) : of({} as TutorialVideo);
    }
    return this.http.get<any>(`${environment.apiUrl}/tutorial-videos/${videoId}`).pipe(
      map((res) => {
        const item = res.data;
        return {
          id: item.id,
          youtubeId: item.youtubeId,
          title: item.title,
          description: item.description,
          externalUrl: item.externalUrl,
          source: item.source
        };
      })
    );
  }

  private extractGuideSlug(routeOrSlug: string): string {
    const normalized = routeOrSlug.trim().replace(/\/+$/, '');
    const routeMatch = normalized.match(/\/(?:guia-pratico|guia)\/([^/?#]+)/);
    if (routeMatch?.[1]) {
      return routeMatch[1];
    }

    return normalized.replace(/^\/+/, '');
  }
}
