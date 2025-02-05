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
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  }

  changeManager(employeeId: number, newManagerId: number) {
    let newManagerData = this.getEmployeeById(employeeId);
    console.log(newManagerData);

    let updatedEmployees = [...this.employees.value];

    const managerIndex = updatedEmployees.findIndex(
      (emp) => emp.id === newManagerId
    );
    const employeeIndex = updatedEmployees.findIndex(
      (emp) => emp.id === employeeId
    );

    if (managerIndex >= 0 && employeeIndex >= 0) {
      updatedEmployees[managerIndex].subordinates.push(employeeId);
      console.log(newManagerData?.managerId);
      updatedEmployees[managerIndex].managerId = newManagerData?.managerId
        ? newManagerData?.managerId
        : null;
      updatedEmployees[employeeIndex].managerId = newManagerId;
    }
    console.log(updatedEmployees);

    this.employees.next(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  }

  getEmployeeById(id: number) {
    return this.employees.value.find((emp) => emp.id === id);
  }
}
