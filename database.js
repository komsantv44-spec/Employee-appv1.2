class EmployeeDatabase {
    constructor() {
        this.keys = {
            employees: 'emp_data_employees_v2',
            attendance: 'emp_data_attendance_v2',
            loans: 'emp_data_loans_v2',
            purchases: 'emp_data_purchases_v2',
            leaves: 'emp_data_leaves_v2',
            tasks: 'emp_data_tasks_v2',
            overtime: 'emp_data_overtime_v2',
            payments: 'emp_data_payments_v2'
        };
        
        this.initDatabase();
    }
    
    initDatabase() {
        Object.values(this.keys).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        
        if (this.getEmployees().length === 0) {
            this.addSampleData();
        }
    }
    
    addSampleData() {
        const sampleEmployees = [
            {
                id: 'EMP001',
                name: 'សុខ សំអាត',
                role: 'អ្នកគ្រប់គ្រង',
                salary: 800,
                dateCreated: '2024-01-01',
                status: 'active'
            },
            {
                id: 'EMP002',
                name: 'មាស ស្រីពេជ្រ',
                role: 'អ្នកជំនាញ',
                salary: 500,
                dateCreated: '2024-01-01',
                status: 'active'
            },
            {
                id: 'EMP003',
                name: 'វិច្ឆិកា រតនៈ',
                role: 'បុគ្គលិក',
                salary: 300,
                dateCreated: '2024-01-01',
                status: 'active'
            }
        ];
        
        localStorage.setItem(this.keys.employees, JSON.stringify(sampleEmployees));
    }
    
    getEmployees() {
        return JSON.parse(localStorage.getItem(this.keys.employees)) || [];
    }
    
    getEmployeeById(id) {
        return this.getEmployees().find(emp => emp.id === id);
    }
    
    addEmployee(employeeData) {
        const employees = this.getEmployees();
        
        if (employees.some(emp => emp.id === employeeData.id)) {
            throw new Error('លេខសម្គាល់បុគ្គលិកមានរួចហើយ!');
        }
        
        const newEmployee = {
            ...employeeData,
            dateCreated: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        
        employees.push(newEmployee);
        localStorage.setItem(this.keys.employees, JSON.stringify(employees));
        
        return newEmployee;
    }
    
    getAttendance(date = null, employeeId = null) {
        const attendance = JSON.parse(localStorage.getItem(this.keys.attendance)) || [];
        
        if (date) {
            const filtered = attendance.filter(record => record.date === date);
            if (employeeId) {
                return filtered.filter(record => record.employeeId === employeeId);
            }
            return filtered;
        }
        
        if (employeeId) {
            return attendance.filter(record => record.employeeId === employeeId);
        }
        
        return attendance;
    }
    
    recordAttendance(employeeId, type = 'checkin') {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].substring(0, 5);
        
        const attendance = this.getAttendance();
        const employee = this.getEmployeeById(employeeId);
        
        if (!employee) {
            throw new Error('បុគ្គលិកមិនត្រូវបានរកឃើញ!');
        }
        
        const todayRecordIndex = attendance.findIndex(record => 
            record.employeeId === employeeId && record.date === today
        );
        
        if (type === 'checkin') {
            if (todayRecordIndex !== -1 && attendance[todayRecordIndex].checkIn) {
                throw new Error('បានកត់ចូលរួចហើយសម្រាប់ថ្ងៃនេះ!');
            }
            
            if (todayRecordIndex !== -1) {
                attendance[todayRecordIndex].checkIn = time;
                attendance[todayRecordIndex].status = 'present';
            } else {
                attendance.push({
                    id: `ATT${Date.now()}`,
                    employeeId: employeeId,
                    employeeName: employee.name,
                    date: today,
                    checkIn: time,
                    checkOut: null,
                    status: 'present',
                    timestamp: now.getTime()
                });
            }
        } else if (type === 'checkout') {
            if (todayRecordIndex === -1 || !attendance[todayRecordIndex].checkIn) {
                throw new Error('មិនទាន់កត់ចូលទេ!');
            }
            
            if (attendance[todayRecordIndex].checkOut) {
                throw new Error('បានកត់ចេញរួចហើយ!');
            }
            
            attendance[todayRecordIndex].checkOut = time;
            attendance[todayRecordIndex].status = 'completed';
        }
        
        localStorage.setItem(this.keys.attendance, JSON.stringify(attendance));
        
        return {
            success: true,
            employee: employee,
            time: time,
            type: type
        };
    }
    
    getStatistics() {
        const employees = this.getEmployees();
        const attendance = this.getAttendance();
        const loans = JSON.parse(localStorage.getItem(this.keys.loans)) || [];
        
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.filter(record => record.date === today);
        
        return {
            totalEmployees: employees.length,
            activeEmployees: employees.filter(emp => emp.status === 'active').length,
            todayPresent: todayAttendance.filter(record => record.checkIn).length,
            totalLoans: loans.reduce((sum, loan) => sum + (loan.amount || 0), 0),
            pendingLoans: loans.filter(loan => loan.status === 'pending').length,
            totalSalary: employees.reduce((sum, emp) => sum + (emp.salary || 0), 0)
        };
    }
}

// Create global instance
const db = new EmployeeDatabase();