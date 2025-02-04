import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Employee } from './employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  public employees = new BehaviorSubject<Employee[]>([]);
  employees$ = this.employees.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees() {
    return this.http.get<Employee[]>('/assets/data/employee-data.json');
  }

  addEmployee(newEmployee: Employee) {
    const updatedEmployees = [...this.employees.value, newEmployee];
    this.employees.next(updatedEmployees);
  }

  removeEmployee(employeeId: number) {
    const updatedEmployees = this.employees.value.filter(
      (emp) => emp.id !== employeeId
    );
    this.employees.next(updatedEmployees);
  }

  changeManager(employeeId: number, newManagerId: number) {
    const updatedEmployees = this.employees.value.map((emp) => {
      if (emp.id === employeeId) {
        return { ...emp, managerId: newManagerId };
      }
      return emp;
    });
    this.employees.next(updatedEmployees);
  }
}
