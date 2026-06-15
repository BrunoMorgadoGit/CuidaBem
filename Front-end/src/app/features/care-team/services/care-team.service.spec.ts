import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CareTeamService } from './care-team.service';
import { environment } from '../../../../environments/environment';

describe('CareTeamService', () => {
  let service: CareTeamService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CareTeamService]
    });
    service = TestBed.inject(CareTeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list members', () => {
    const dummyMembers = [
      { id: '1', patientId: 'p1', userId: 'u1', role: 'responsible', active: true, createdAt: '', updatedAt: '' }
    ];

    service.listMembers('p1').subscribe((members) => {
      expect(members.length).toBe(1);
      expect(members).toEqual(dummyMembers);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients/p1/members`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: dummyMembers });
  });

  it('should add a member', () => {
    const dummyMember = { id: '2', role: 'family' };

    service.addMember('p1', 'test@test.com', 'family').subscribe((member) => {
      expect(member).toEqual(dummyMember);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients/p1/members`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', role: 'family' });
    req.flush({ data: dummyMember });
  });

  it('should update a member role', () => {
    const dummyMember = { id: '1', role: 'caregiver' };

    service.updateMember('1', 'caregiver').subscribe((member) => {
      expect(member).toEqual(dummyMember);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/members/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ role: 'caregiver' });
    req.flush({ data: dummyMember });
  });

  it('should remove a member', () => {
    service.removeMember('1').subscribe((res) => {
      expect(res.deleted).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/members/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: { deleted: true } });
  });
});
