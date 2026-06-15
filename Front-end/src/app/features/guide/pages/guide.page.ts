import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PageShellComponent } from '../../../shared/components/page-shell/page-shell.component';
import { trackById } from '../../../shared/utils';
import { GuideCardComponent, GuideVideoComponent } from '../components';
import type { GuideFeatureItem, GuideItem, GuideItemGroup, GuideTutorialItem, TutorialVideo } from '../models';
import { GuideService } from '../services/guide.service';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, GuideCardComponent, GuideVideoComponent, PageShellComponent, RouterLink],
  templateUrl: './guide.page.html',
  styleUrls: ['./guide.page.css'],
  encapsulation: ViewEncapsulation.None
})
export class GuidePage implements OnInit {
  private readonly guideService = inject(GuideService);
  private readonly cdr = inject(ChangeDetectorRef);

  featuredGuide: GuideFeatureItem = {
    id: 'guide-feature-elder-protection',
    link: '/violence',
    title: 'Proteção do Idoso',
    detail: '7 tipos de violência · Sinais de alerta · Canais de denúncia',
    source: 'Fonte: Ministério dos Direitos Humanos e da Cidadania, 2023',
    icon: 'SH',
    badge: 'Material Educativo'
  };
  guideGroups: GuideItemGroup[] = [];
  tutorialItems: GuideTutorialItem[] = [];

  readonly trackByGroupId = trackById<GuideItemGroup>;
  readonly trackByGuideId = trackById<GuideItem>;
  readonly trackByTutorialId = trackById<GuideTutorialItem>;

  videoModalOpen = false;
  activeTutorialVideo: TutorialVideo | null = null;

  ngOnInit(): void {
    this.guideService.getFeaturedGuideApi().subscribe((res) => {
      this.featuredGuide = res;
    });

    this.guideService.getGuideItemGroupsApi().subscribe((res) => {
      this.guideGroups = res;
    });

    this.guideService.getTutorialItemsApi().subscribe((res) => {
      this.tutorialItems = res;
    });
  }

  openVideoModal(tutorial: GuideTutorialItem): void {
    this.guideService.getTutorialVideoByIdApi(tutorial.videoId).subscribe({
      next: (video) => {
        if (!video) {
          return;
        }
        this.activeTutorialVideo = video;
        this.videoModalOpen = true;
      }
    });
  }

  closeVideoModal(): void {
    this.videoModalOpen = false;
    this.activeTutorialVideo = null;
  }
}
