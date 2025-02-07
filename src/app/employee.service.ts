import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Employee } from './employee.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  public employees = new BehaviorSubject<Employee[]>([]);
  employees$ = this.employees.asObservable();
  private apiUrl = `${environment.apiUrl}/employees.json`;

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.http.get<Employee[]>(this.apiUrl).subscribe((data) => {
      let employees = Object.values(data).map((emp) => ({
        ...emp,
        subordinates: emp.subordinates ? emp.subordinates : [],
      }));
      this.employees.next(employees);
    });
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
        manager.subordinates = manager.subordinates || [];
        manager.subordinates.push(newEmployee.id);
      }
    }

    this.employees.next(updatedEmployees);
    this.http.put(this.apiUrl, updatedEmployees).subscribe();
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
    this.http.put(this.apiUrl, updatedEmployees).subscribe();
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

    this.employees.next(updatedEmployees);
    this.http.put(this.apiUrl, updatedEmployees).subscribe();
  }

  getEmployeeById(id: number) {
    return this.employees.value.find((emp) => emp.id === id);
  }
}
