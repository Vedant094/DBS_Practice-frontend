import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerUsers } from './manager-users';

describe('ManagerUsers', () => {
  let component: ManagerUsers;
  let fixture: ComponentFixture<ManagerUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
