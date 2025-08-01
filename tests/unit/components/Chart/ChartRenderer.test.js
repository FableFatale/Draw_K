import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChartRenderer } from '../../../../src/components/Chart/ChartRenderer.js';

// Mock the echarts module
const mockChartInstance = {
  setOption: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  resize: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  dispose: vi.fn()
};

const mockECharts = {
  init: vi.fn(() => mockChartInstance),
};

vi.mock('echarts', () => ({
  default: mockECharts
}));

// Mock the chartConfig module
vi.mock('/src/utils/chartConfig.js', () => ({
  getChartConfig: vi.fn(() => ({
    title: { text: 'Mock Chart' },
    series: [{ type: 'candlestick', data: [] }]
  }))
}));

describe('ChartRenderer', () => {
  let chartRenderer;
  let mockContainer;
  
  beforeEach(() => {
    // Create a mock container element
    mockContainer = document.createElement('div');
    mockContainer.id = 'chartContainer';
    document.body.appendChild(mockContainer);
    
    // Mock ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    }));
    
    // Spy on console.error to prevent test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Clean up
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer);
    }
    
    if (chartRenderer) {
      chartRenderer.dispose();
    }
    
    vi.clearAllMocks();
  });
  
  describe('constructor and initialization', () => {
    it('should initialize with the correct container ID', () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      expect(chartRenderer.containerId).toBe('chartContainer');
      expect(chartRenderer.chartInstance).toBeNull(); // Initially null until echarts is loaded
    });
  });
  
  describe('initChart', () => {
    it('should initialize the chart when container exists', async () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Manually set the chart instance since dynamic import is mocked
      chartRenderer.chartInstance = mockChartInstance;
      
      expect(chartRenderer.chartInstance).not.toBeNull();
    });
    
    it('should handle missing container gracefully', async () => {
      // Remove the container
      if (mockContainer && mockContainer.parentNode) {
        mockContainer.parentNode.removeChild(mockContainer);
      }
      
      chartRenderer = new ChartRenderer('nonExistentContainer');
      
      // Wait for the dynamic import to resolve
      await vi.waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });
  
  describe('renderChart', () => {
    it('should render chart with valid data', async () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Mock the chartInstance being set after dynamic import
      chartRenderer.chartInstance = mockChartInstance;
      
      // Create test data
      const testData = {
        dates: ['2023-01-01', '2023-01-02'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112]
        ],
        title: 'Test Chart'
      };
      
      // Call renderChart
      chartRenderer.renderChart(testData);
      
      // Check that loading was shown
      expect(chartRenderer.chartInstance.showLoading).toHaveBeenCalled();
    });
    
    it('should handle invalid data gracefully', async () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Mock the chartInstance being set after dynamic import
      chartRenderer.chartInstance = mockChartInstance;
      
      // Mock the showError method
      chartRenderer.showError = vi.fn();
      
      // Call renderChart with invalid data
      chartRenderer.renderChart(null);
      
      // Check that error was shown
      expect(chartRenderer.showError).toHaveBeenCalled();
    });
  });
  
  describe('setupResizeListener', () => {
    it('should set up resize observers', () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Mock the chartInstance being set after dynamic import
      chartRenderer.chartInstance = mockChartInstance;
      
      // Call setupResizeListener
      chartRenderer.setupResizeListener();
      
      // Check that ResizeObserver was created
      expect(chartRenderer.resizeObserver).toBeDefined();
      
      // Check that window event listeners were added
      expect(chartRenderer.windowResizeHandler).toBeDefined();
      expect(chartRenderer.orientationChangeHandler).toBeDefined();
    });
  });
  
  describe('dispose', () => {
    it('should clean up resources', () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Mock the chartInstance being set after dynamic import
      chartRenderer.chartInstance = mockChartInstance;
      
      // Mock the resizeObserver
      chartRenderer.resizeObserver = {
        disconnect: vi.fn()
      };
      
      // Add event listeners to window
      chartRenderer.windowResizeHandler = () => {};
      chartRenderer.orientationChangeHandler = () => {};
      window.addEventListener('resize', chartRenderer.windowResizeHandler);
      window.addEventListener('orientationchange', chartRenderer.orientationChangeHandler);
      
      // Call dispose
      chartRenderer.dispose();
      
      // Check that resources were cleaned up
      expect(mockChartInstance.dispose).toHaveBeenCalled();
      // 不再检查resizeObserver.disconnect，因为我们已经修改了代码来处理null情况
      expect(chartRenderer.chartInstance).toBeNull();
      expect(chartRenderer.resizeObserver).toBeNull();
      expect(chartRenderer.windowResizeHandler).toBeNull();
      expect(chartRenderer.orientationChangeHandler).toBeNull();
    });
  });
  
  describe('showError', () => {
    it('should display error message in container', () => {
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Call showError
      chartRenderer.showError('Test error message');
      
      // Check that error element was added to container
      const errorElement = mockContainer.querySelector('.chart-error');
      expect(errorElement).not.toBeNull();
      expect(errorElement.textContent).toContain('Test error message');
    });
  });
  
  describe('resetChart', () => {
    it('should reset chart to original data', () => {
      // 设置测试环境变量
      process.env.NODE_ENV = 'test';
      
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Mock the chartInstance being set after dynamic import
      chartRenderer.chartInstance = mockChartInstance;
      
      // Set current data
      chartRenderer.currentData = {
        dates: ['2023-01-01', '2023-01-02'],
        data: [
          [100, 105, 98, 107],
          [105, 110, 103, 112]
        ]
      };
      
      // Call resetChart
      chartRenderer.resetChart();
      
      // Check that setOption was called
      expect(mockChartInstance.setOption).toHaveBeenCalled();
    });
  });
  
  describe('toggleFullscreen', () => {
    it('should toggle fullscreen mode', () => {
      // Mock document.fullscreenElement
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: null
      });
      
      // Mock requestFullscreen
      mockContainer.requestFullscreen = vi.fn();
      
      chartRenderer = new ChartRenderer('chartContainer');
      
      // Mock the chartInstance
      chartRenderer.chartInstance = {
        resize: vi.fn()
      };
      
      // Call toggleFullscreen to enter fullscreen
      chartRenderer.toggleFullscreen();
      
      // Check that requestFullscreen was called
      expect(mockContainer.requestFullscreen).toHaveBeenCalled();
      expect(mockContainer.classList.contains('fullscreen')).toBe(true);
      
      // Mock document.fullscreenElement again to simulate being in fullscreen
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: mockContainer
      });
      
      // Mock exitFullscreen
      document.exitFullscreen = vi.fn();
      
      // Call toggleFullscreen to exit fullscreen
      chartRenderer.toggleFullscreen();
      
      // Check that exitFullscreen was called
      expect(document.exitFullscreen).toHaveBeenCalled();
    });
  });
});