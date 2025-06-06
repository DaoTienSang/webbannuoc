import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AdminAnalyticsProps {
  onBack: () => void;
}

export function AdminAnalytics({ onBack }: AdminAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("week");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  
  const analytics = useQuery(api.admin.getAnalyticsData, { timeRange }) || {
    salesByDay: [],
    salesByCategory: [],
    topProducts: [],
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  };

  const [maxSaleValue, setMaxSaleValue] = useState(0);

  // Tính giá trị bán cao nhất để làm chuẩn cho biểu đồ
  useEffect(() => {
    if (analytics.salesByDay.length > 0) {
      const max = Math.max(...analytics.salesByDay.map(day => day.amount));
      setMaxSaleValue(max > 0 ? max : 1); // Tránh chia cho 0
    }
  }, [analytics.salesByDay]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-black rounded-xl font-medium hover:bg-gray-200 transition-all duration-300"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-black">📊 Báo cáo & Thống kê</h1>
      </div>

      {/* Time range selector */}
      <div className="glass p-4 rounded-2xl mb-6">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setTimeRange("day")}
            className={`px-4 py-2 rounded-xl font-medium ${
              timeRange === "day" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Hôm nay
          </button>
          <button 
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-xl font-medium ${
              timeRange === "week" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Tuần này
          </button>
          <button 
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-xl font-medium ${
              timeRange === "month" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Tháng này
          </button>
          <button 
            onClick={() => setTimeRange("year")}
            className={`px-4 py-2 rounded-xl font-medium ${
              timeRange === "year" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            Năm nay
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 hover:from-blue-500/30 hover:to-blue-600/10 transition-all duration-300 transform hover:scale-[1.02] shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
              <span className="text-3xl">💰</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">{analytics.totalSales.toLocaleString('vi-VN')}đ</h3>
              <p className="text-black/70 text-sm">Doanh thu</p>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mt-2"></div>
        </div>
        
        <div className="glass p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/5 hover:from-green-500/30 hover:to-green-600/10 transition-all duration-300 transform hover:scale-[1.02] shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
              <span className="text-3xl">📦</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">{analytics.totalOrders}</h3>
              <p className="text-black/70 text-sm">Đơn hàng</p>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-300 rounded-full mt-2"></div>
        </div>
        
        <div className="glass p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 hover:from-purple-500/30 hover:to-purple-600/10 transition-all duration-300 transform hover:scale-[1.02] shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
              <span className="text-3xl">💎</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-black">{analytics.averageOrderValue.toLocaleString('vi-VN')}đ</h3>
              <p className="text-black/70 text-sm">Giá trị trung bình</p>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-300 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="glass p-6 rounded-2xl mb-6 bg-gradient-to-br from-blue-500/5 to-blue-600/10 hover:from-blue-500/10 hover:to-blue-600/15 transition-all duration-300 transform">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-black">📈 Biểu đồ doanh thu</h2>
            <div className="ml-4 flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  chartType === "bar"
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-black hover:bg-gray-200"
                }`}
              >
                Cột
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  chartType === "line"
                    ? "bg-blue-500 text-white"
                    : "bg-transparent text-black hover:bg-gray-200"
                }`}
              >
                Đường
              </button>
            </div>
          </div>
          <div className="text-xs text-black/60">
            * Giá trị cao nhất: {maxSaleValue.toLocaleString('vi-VN')}đ
          </div>
        </div>
        {analytics.salesByDay.length > 0 ? (
          <div className="h-80 w-full p-4 bg-white/40 rounded-xl shadow-sm">
            {/* Y-axis labels */}
            <div className="h-full w-full flex relative">
              <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-black/50 pointer-events-none">
                <div>100%</div>
                <div>75%</div>
                <div>50%</div>
                <div>25%</div>
                <div>0%</div>
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-black/10 w-full h-0"></div>
                <div className="border-t border-black/10 w-full h-0"></div>
                <div className="border-t border-black/10 w-full h-0"></div>
                <div className="border-t border-black/10 w-full h-0"></div>
                <div className="border-t border-black/10 w-full h-0"></div>
              </div>
              
              {/* Bars or Line chart */}
              {chartType === "bar" ? (
                <div className="h-full w-full flex items-end justify-between space-x-1 ml-10 pr-2 relative z-10">
                  {analytics.salesByDay.map((day, index) => {
                    // Tính phần trăm chiều cao dựa trên giá trị lớn nhất
                    const heightPercent = maxSaleValue > 0 
                      ? (day.amount / maxSaleValue) * 100
                      : 0;
                    
                    // Chiều cao hiển thị chính xác theo tỷ lệ
                    const displayHeight = heightPercent;
                    
                    // Chọn màu dựa trên giá trị (cao hơn = màu đậm hơn)
                    const colorClass = heightPercent > 75 ? "from-blue-700 to-blue-500" :
                                      heightPercent > 50 ? "from-blue-600 to-blue-400" :
                                      heightPercent > 25 ? "from-blue-500 to-blue-300" : 
                                                          "from-blue-400 to-blue-200";
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                          <div className="font-semibold">{day.amount.toLocaleString('vi-VN')}đ</div>
                          <div className="text-xs font-light mt-1 text-center border-t border-gray-700 pt-1">
                            {heightPercent.toFixed(1)}% so với giá trị cao nhất
                          </div>
                        </div>
                        <div 
                          className={`w-[80%] bg-gradient-to-t ${colorClass} hover:brightness-110 transition-all duration-200 rounded-lg transform group-hover:scale-105 shadow-lg`}
                          style={{ 
                            height: `${displayHeight}%`,
                            minHeight: day.amount > 0 ? '2px' : '0px',
                            boxShadow: day.amount > 0 ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                          }}
                        ></div>
                        <div className="mt-2 flex flex-col items-center">
                          <div className="text-xs text-black whitespace-nowrap overflow-hidden text-ellipsis w-full text-center font-medium">
                            {day.label}
                          </div>
                          <div className="text-xs text-black/60">
                            {day.amount.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Line chart */
                <div className="h-full w-full relative ml-10 pr-2 z-10">
                  {/* Data points */}
                  <svg className="h-full w-full" viewBox={`0 0 ${analytics.salesByDay.length * 100} 100`} preserveAspectRatio="none">
                    {/* Line */}
                    <polyline
                      points={analytics.salesByDay.map((day, index) => {
                        const x = index * (100 / (analytics.salesByDay.length - 1));
                        const y = maxSaleValue > 0 
                          ? 100 - ((day.amount / maxSaleValue) * 100)
                          : 100;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="url(#blue-gradient)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="drop-shadow-md"
                    />
                    
                    {/* Line gradient */}
                    <defs>
                      <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                    
                    {/* Fill area under curve */}
                    <path
                      d={`
                        ${analytics.salesByDay.map((day, index) => {
                          const x = index * (100 / (analytics.salesByDay.length - 1));
                          const y = maxSaleValue > 0 
                            ? 100 - ((day.amount / maxSaleValue) * 100)
                            : 100;
                          return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                        }).join(' ')}
                        L ${(analytics.salesByDay.length - 1) * (100 / (analytics.salesByDay.length - 1))},100
                        L 0,100
                        Z
                      `}
                      fill="url(#area-gradient)"
                      opacity="0.3"
                    />
                    
                    {/* Area gradient */}
                    <defs>
                      <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Data points */}
                    {analytics.salesByDay.map((day, index) => {
                      const x = index * (100 / (analytics.salesByDay.length - 1));
                      const y = maxSaleValue > 0 
                        ? 100 - ((day.amount / maxSaleValue) * 100)
                        : 100;
                        
                      return (
                        <g key={index} className="group">
                          <circle
                            cx={x}
                            cy={y}
                            r="2"
                            fill="#3b82f6"
                            className="drop-shadow-sm"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="rgba(59, 130, 246, 0.2)"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          />
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="flex justify-between w-full mt-2">
                    {analytics.salesByDay.map((day, index) => (
                      <div key={index} className="text-xs text-center flex flex-col items-center">
                        <div className="text-black whitespace-nowrap overflow-hidden text-ellipsis w-full font-medium">
                          {day.label}
                        </div>
                        <div className="text-black/60">
                          {day.amount.toLocaleString('vi-VN')}đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-gray-400">Không có dữ liệu doanh thu trong khoảng thời gian này</p>
          </div>
        )}
      </div>

      {/* Sales by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass p-6 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 hover:from-indigo-500/10 hover:to-indigo-600/15 transition-all duration-300 transform">
          <h2 className="text-xl font-bold text-black mb-4">🏷️ Doanh thu theo danh mục</h2>
          {analytics.salesByCategory.length > 0 ? (
            <div className="space-y-4">
              {analytics.salesByCategory.map((category, index) => {
                // Tính phần trăm dựa trên giá trị cao nhất
                const maxCategoryAmount = Math.max(...analytics.salesByCategory.map(c => c.amount));
                const percent = (category.amount / maxCategoryAmount) * 100;
                
                // Màu dựa vào thứ hạng
                const colors = [
                  "from-blue-600 to-blue-400",
                  "from-purple-600 to-purple-400",
                  "from-green-600 to-green-400",
                  "from-amber-600 to-amber-400",
                  "from-pink-600 to-pink-400",
                  "from-teal-600 to-teal-400",
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div key={index} className="relative hover:scale-[1.01] transition-all duration-200">
                    <div className="flex justify-between mb-1 items-center">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 bg-gradient-to-r ${colorClass}`}></span>
                        <span className="text-black font-medium">{category.name}</span>
                      </div>
                      <span className="text-black font-semibold">{category.amount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400">Không có dữ liệu danh mục trong khoảng thời gian này</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="glass p-6 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-600/10 hover:from-amber-500/10 hover:to-amber-600/15 transition-all duration-300 transform">
          <h2 className="text-xl font-bold text-black mb-4">🌟 Sản phẩm bán chạy</h2>
          {analytics.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => {
                // Màu dựa vào thứ hạng
                const badges = [
                  "bg-gradient-to-r from-yellow-500 to-amber-500 text-white", // Top 1
                  "bg-gradient-to-r from-gray-400 to-gray-500 text-white", // Top 2
                  "bg-gradient-to-r from-amber-700 to-amber-800 text-white", // Top 3
                  "bg-gradient-to-r from-blue-500 to-blue-600 text-white", // Top 4
                  "bg-gradient-to-r from-purple-500 to-purple-600 text-white", // Top 5
                ];
                
                // Tính phần trăm doanh thu so với sản phẩm bán chạy nhất
                const maxRevenue = Math.max(...analytics.topProducts.map(p => p.revenue));
                const percent = (product.revenue / maxRevenue) * 100;
                
                return (
                  <div key={index} className="bg-white/40 p-3 rounded-xl hover:bg-white/60 transition-all duration-200 transform hover:scale-[1.01] shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${badges[index]}`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-black">{product.name}</div>
                        <div className="flex items-center mt-1">
                          <div className="text-xs text-black/70 mr-2">{product.quantity} đã bán</div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex-1">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-black font-bold">
                        {product.revenue.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400">Không có dữ liệu sản phẩm trong khoảng thời gian này</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Data Button */}
      <div className="glass p-6 rounded-2xl bg-gradient-to-br from-gray-500/5 to-gray-600/10 hover:from-gray-500/10 hover:to-gray-600/15 transition-all duration-300 transform">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-black mb-1">💾 Xuất báo cáo</h2>
            <p className="text-black/70">Tải xuống báo cáo chi tiết dưới dạng tệp CSV</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-sm"
          >
            Xuất báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
