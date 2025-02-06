import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Employee } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  public employees = new BehaviorSubject<Employee[]>(this.getStoredEmployees());
  employees$ = this.employees.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private getStoredEmployees(): Employee[] {
    const storedData = localStorage.getItem('employees');
    return storedData ? JSON.parse(storedData) : [];
  }

  private loadInitialData() {
    if (this.getStoredEmployees().length === 0) {
      this.http
        .get<Employee[]>('/assets/data/employee-data.json')
        .subscribe((data) => {
          this.employees.next(data);
          localStorage.setItem('employees', JSON.stringify(data));
        });
    }
  }

  getEmployees() {
    return this.employees$;
  }

  addEmployee(newEmployee: Employee) {
    const updatedEmployees = [...this.employees.value, newEmployee];
    if (newEmployee.managerId) {
      const manager = updatedEmployees.find(
        (emp) => emp.id === newEmployee.managerId
      );
      if (manager) {
        manager.subordinates.push(newEmployee.id);
      }
    }
    this.setEmployeeExpanded();
    this.employees.next(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  }

  removeEmployee(employeeId: number) {
    let updatedEmployees = this.employees.value.filter(
      (emp) => emp.id !== employeeId
    );

    updatedEmployees = updatedEmployees.map((emp) => {
      return {
        ...emp,
        subordinates: emp.subordinates.filter((id) => id !== employeeId),
      };
    });
    this.employees.next(updatedEmployees);
    this.setEmployeeExpanded();
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  }

  changeManager(employeeId: number, newManagerId: number) {
    let updatedEmployees = [...this.employees.value];

    const employee = updatedEmployees.find((emp) => emp.id === employeeId);
    const newManager = updatedEmployees.find((emp) => emp.id === newManagerId);

    if (employee && newManager) {
      [employee.name, newManager.name] = [newManager.name, employee.name];
      [employee.email, newManager.email] = [newManager.email, employee.email];
      [employee.imageUrl, newManager.imageUrl] = [
        newManager.imageUrl,
        employee.imageUrl,
      ];
      [employee.designation, newManager.designation] = [
        newManager.designation,
        employee.designation,
      ];
    }

    this.setEmployeeExpanded();
    this.employees.next(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  }

  getEmployeeById(id: number) {
    return this.employees.value.find((emp) => emp.id === id);
  }

  setEmployeeExpanded() {
    this.employees.next(
      this.employees.value.map((emp) => {
        emp.isExpanded = false;
        return emp;
      })
    );
  }
}
