import { Component, OnInit } from '@angular/core';
import { Employee } from './employee.model';
import { EmployeeService } from './employee.service';
import { MatDialog } from '@angular/material/dialog';
import { AddSubordinateComponent } from './add-subordinate/add-subordinate.component';
import { RemoveEmployeeComponent } from './remove-employee/remove-employee.component';
import { ChangeManagerComponent } from './change-manager/change-manager.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
    ]),
    trigger('expandLine', [
      transition(':enter', [
        style({ width: '0px', opacity: 0 }),
        animate('300ms ease-out', style({ width: '2px', opacity: 1 })),
      ]),
    ]),
    trigger('horizontalExpand', [
      transition(':enter', [
        style({ width: '0px', opacity: 0 }),
        animate('300ms ease-out', style({ width: '100%', opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  employees: Employee[] = [];
  hierarchy: Employee[] = [];
  treeLevels: number[][] = [];

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
      this.updateTree();
    });
  }

  updateTree() {
    this.treeLevels = [];
    const manager = this.employees.find((e) => !e.managerId);
    if (manager) {
      this.treeLevels.push([manager.id]);
      this.hierarchy = this.buildHierarchy(manager.id);
    }
  }

  buildHierarchy(managerId: number | null): Employee[] {
    return this.employees.filter((emp) => emp.managerId === managerId);
  }

  getSubordinates(managerId: number): Employee[] {
    return this.employees.filter((emp) => emp.managerId === managerId);
  }

  toggleSubordinates(empId: number): void {
    const employee = this.getEmployeeDetails(empId);
    if (!employee) return;

    const index = this.treeLevels.findIndex((level) => level.includes(empId));

    employee.isExpanded = !employee.isExpanded;

    this.treeLevels[index]?.forEach((id) => {
      if (id !== empId) {
        const otherEmp = this.getEmployeeDetails(id);
        if (otherEmp) otherEmp.isExpanded = false;
      }
    });

    this.treeLevels
      .slice(index + 1)
      .flat()
      .forEach((id) => {
        const emp = this.getEmployeeDetails(id);
        if (emp) emp.isExpanded = false;
      });

    this.treeLevels.splice(index + 1);

    if (employee.isExpanded) {
      const subordinates = this.getSubordinates(employee.id);
      if (subordinates.length > 0) {
        this.treeLevels.push(subordinates.map((sub) => sub.id));
      }
    }
  }

  getEmployeeDetails(empId: number): Employee | undefined {
    return this.employees.find((emp) => emp.id === empId);
  }

  openAddSubordinateDialog(managerId: number, event: MouseEvent) {
    event.stopPropagation();
    const manager = this.getEmployeeDetails(managerId);
    if (!manager || manager.subordinates?.length === 5) return;
    this.dialog.open(AddSubordinateComponent, { data: manager });
  }

  openRemoveDialog(employeeId: number, event: MouseEvent) {
    event.stopPropagation();
    console.log(employeeId);

    const employee = this.getEmployeeDetails(employeeId);

    if (!employee) return;
    if (employee.subordinates.length !== 0) return;
    console.log(employee?.subordinates);

    const dialogRef = this.dialog.open(RemoveEmployeeComponent, {
      data: employee,
      disableClose: false,
    });
  }

  openChangeManagerDialog(managerId: number, event: MouseEvent) {
    event.stopPropagation();
    const manager = this.getEmployeeDetails(managerId);
    this.dialog.open(ChangeManagerComponent, {
      data: manager,
    });
  }
}
