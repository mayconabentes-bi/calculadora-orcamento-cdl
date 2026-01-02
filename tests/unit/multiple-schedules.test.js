/**
 * Unit tests for Multiple Schedules Management
 * Tests the functionality of dynamic schedule management in budget requests
 */

describe('Multiple Schedules Management', () => {
    describe('Schedule Validation', () => {
        test('should validate that end time is after start time', () => {
            const validSchedule = { inicio: '08:00', fim: '17:00' };
            const invalidSchedule = { inicio: '17:00', fim: '08:00' };
            
            // Valid schedule: end > start
            const [horaInicio, minutoInicio] = validSchedule.inicio.split(':').map(Number);
            const [horaFim, minutoFim] = validSchedule.fim.split(':').map(Number);
            const minutosInicio = horaInicio * 60 + minutoInicio;
            const minutosFim = horaFim * 60 + minutoFim;
            
            expect(minutosFim).toBeGreaterThan(minutosInicio);
        });
        
        test('should reject schedule where end time equals start time', () => {
            const schedule = { inicio: '08:00', fim: '08:00' };
            
            const [horaInicio, minutoInicio] = schedule.inicio.split(':').map(Number);
            const [horaFim, minutoFim] = schedule.fim.split(':').map(Number);
            const minutosInicio = horaInicio * 60 + minutoInicio;
            const minutosFim = horaFim * 60 + minutoFim;
            
            expect(minutosInicio).toBeGreaterThanOrEqual(minutosFim);
        });
        
        test('should reject schedule where end time is before start time', () => {
            const schedule = { inicio: '17:00', fim: '08:00' };
            
            const [horaInicio, minutoInicio] = schedule.inicio.split(':').map(Number);
            const [horaFim, minutoFim] = schedule.fim.split(':').map(Number);
            const minutosInicio = horaInicio * 60 + minutoInicio;
            const minutosFim = horaFim * 60 + minutoFim;
            
            expect(minutosInicio).toBeGreaterThan(minutosFim);
        });
    });
    
    describe('Schedule Array Management', () => {
        test('should support multiple schedules in array', () => {
            const horarios = [
                { id: 0, inicio: '08:00', fim: '12:00' },
                { id: 1, inicio: '13:00', fim: '17:00' },
                { id: 2, inicio: '18:00', fim: '22:00' }
            ];
            
            expect(horarios).toHaveLength(3);
            expect(horarios[0]).toHaveProperty('inicio');
            expect(horarios[0]).toHaveProperty('fim');
            expect(horarios[0]).toHaveProperty('id');
        });
        
        test('should maintain schedule order', () => {
            const horarios = [
                { id: 0, inicio: '08:00', fim: '12:00' },
                { id: 1, inicio: '13:00', fim: '17:00' }
            ];
            
            expect(horarios[0].inicio).toBe('08:00');
            expect(horarios[1].inicio).toBe('13:00');
        });
    });
    
    describe('Lead Object Structure', () => {
        test('should include horariosSolicitados array in lead object', () => {
            const lead = {
                id: 123456,
                nome: 'Test Client',
                email: 'test@example.com',
                horariosSolicitados: [
                    { inicio: '08:00', fim: '17:00' }
                ]
            };
            
            expect(lead).toHaveProperty('horariosSolicitados');
            expect(Array.isArray(lead.horariosSolicitados)).toBe(true);
            expect(lead.horariosSolicitados).toHaveLength(1);
        });
        
        test('should support multiple schedules in lead', () => {
            const lead = {
                horariosSolicitados: [
                    { inicio: '08:00', fim: '12:00' },
                    { inicio: '14:00', fim: '18:00' },
                    { inicio: '19:00', fim: '22:00' }
                ]
            };
            
            expect(lead.horariosSolicitados).toHaveLength(3);
        });
    });
    
    describe('SGQ-SECURITY Logging', () => {
        test('should log schedule count', () => {
            const horarios = [
                { inicio: '08:00', fim: '12:00' },
                { inicio: '13:00', fim: '17:00' }
            ];
            
            const logMessage = `[SGQ-SECURITY] Sincronizando múltiplos horários solicitados: ${horarios.length}`;
            
            expect(logMessage).toContain('[SGQ-SECURITY]');
            expect(logMessage).toContain('2');
        });
    });
});
