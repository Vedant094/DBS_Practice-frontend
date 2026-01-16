import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitRequestComponent } from './submit-request';

describe('SubmitRequest', () => {
  let component: SubmitRequestComponent;
  let fixture: ComponentFixture<SubmitRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
