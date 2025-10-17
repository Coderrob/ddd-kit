import pino from 'pino';

import { ObservabilityLogger } from './observability.logger';

describe('ObservabilityLogger', () => {
  let logger: ObservabilityLogger;
  let pinoLogger: pino.Logger;

  beforeEach(() => {
    pinoLogger = pino({ level: 'silent' }); // Silent logger for tests
    logger = new ObservabilityLogger(pinoLogger);
  });

  it('should create correlation IDs', () => {
    const correlationId = logger.createCorrelationId();
    expect(correlationId).toBeDefined();
    expect(typeof correlationId).toBe('string');
    expect(correlationId.length).toBeGreaterThan(0);
  });

  it('should handle counter metrics', () => {
    expect(() => {
      logger.counter('test.counter');
      logger.counter('test.counter', { label: 'value' });
    }).not.toThrow();
  });

  it('should handle timer metrics', () => {
    const timer = logger.startTimer('test.timer');
    expect(timer).toBeDefined();
    expect(typeof timer).toBe('function');

    // Timer should be callable
    expect(() => {
      timer();
    }).not.toThrow();
  });

  it('should create contextual loggers with correlation', () => {
    const correlationId = logger.createCorrelationId();
    const contextLogger = logger.withCorrelation(correlationId, 'test_operation', {
      testData: 'value',
    });

    expect(contextLogger).toBeDefined();
    expect(() => {
      contextLogger.info('Test message');
    }).not.toThrow();
  });

  it('should handle business events', () => {
    expect(() => {
      logger.event('test_event', {
        property: 'value',
        count: 42,
      });
    }).not.toThrow();
  });

  it('should handle health checks', () => {
    expect(() => {
      logger.health('test_service', 'healthy', 100, { response_time: 100 });
      logger.health('test_service', 'unhealthy');
    }).not.toThrow();
  });

  it('should handle performance spans', () => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 1000);

    const act = () => {
      logger.span('test_operation', startTime, endTime, { success: true });
    };

    expect(act).not.toThrow();
  });
});
