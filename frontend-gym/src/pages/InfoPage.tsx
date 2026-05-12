import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Truck, RotateCcw, Package, HelpCircle, Users, GraduationCap } from 'lucide-react';

interface PageContent {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const PAGE_DATA: Record<string, PageContent> = {
  'shipping-info': {
    title: 'Thông tin giao hàng',
    icon: <Truck className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p>Chúng tôi cam kết mang đến dịch vụ giao hàng nhanh chóng và tin cậy nhất cho khách hàng.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="bg-brand-light p-8 rounded-sm">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Giao hàng tiêu chuẩn</h3>
            <p className="text-sm text-gray-600 font-medium">Thời gian: 3-5 ngày làm việc</p>
            <p className="text-sm text-gray-600 font-medium">Phí: 30.000 ₫ (Miễn phí cho đơn hàng trên 2.000.000 ₫)</p>
          </div>
          <div className="bg-brand-light p-8 rounded-sm">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Giao hàng hỏa tốc</h3>
            <p className="text-sm text-gray-600 font-medium">Thời gian: 1-2 ngày làm việc</p>
            <p className="text-sm text-gray-600 font-medium">Phí: 50.000 ₫</p>
          </div>
        </div>
        <div className="mt-10">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Theo dõi đơn hàng</h3>
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            Sau khi đơn hàng được gửi đi, bạn sẽ nhận được một email chứa mã vận đơn. Bạn có thể sử dụng mã này để theo dõi hành trình đơn hàng của mình tại trang "Đơn hàng".
          </p>
        </div>
      </div>
    )
  },
  'returns-policy': {
    title: 'Chính sách đổi trả',
    icon: <RotateCcw className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p>Sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi. Nếu bạn không hoàn toàn hài lòng với sản phẩm, chúng tôi sẵn sàng hỗ trợ đổi trả.</p>
        <div className="space-y-8 mt-10">
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Điều kiện đổi trả</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 font-medium">
              <li>Sản phẩm còn nguyên tem mác, chưa qua sử dụng hoặc giặt là.</li>
              <li>Trong vòng 30 ngày kể từ ngày nhận hàng.</li>
              <li>Sản phẩm không nằm trong danh mục không được đổi trả (ví dụ: đồ lót, phụ kiện vệ sinh cá nhân).</li>
            </ul>
          </section>
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Quy trình đổi trả</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              1. Liên hệ với bộ phận chăm sóc khách hàng qua Trung tâm hỗ trợ.<br/>
              2. Đóng gói sản phẩm cẩn thận kèm theo hóa đơn.<br/>
              3. Gửi sản phẩm về địa chỉ kho của chúng tôi hoặc mang trực tiếp đến cửa hàng gần nhất.
            </p>
          </section>
        </div>
      </div>
    )
  },
  'orders': {
    title: 'Đơn hàng',
    icon: <Package className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p>Quản lý và theo dõi các đơn hàng của bạn tại đây.</p>
        <div className="bg-brand-light p-12 rounded-sm text-center mt-10">
          <Package className="w-12 h-12 mx-auto mb-6 text-gray-300" />
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Vui lòng đăng nhập để xem lịch sử đơn hàng</p>
          <button className="mt-8 px-8 py-4 bg-brand-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all">
            Đăng nhập ngay
          </button>
        </div>
      </div>
    )
  },
  'help-center': {
    title: 'Trung tâm hỗ trợ',
    icon: <HelpCircle className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p>Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {['Câu hỏi thường gặp', 'Liên hệ chúng tôi', 'Chat trực tuyến'].map(item => (
            <button key={item} className="p-8 border border-gray-100 hover:border-brand-dark transition-all text-center group">
              <h4 className="text-[10px] font-black uppercase tracking-widest group-hover:text-brand-dark">{item}</h4>
            </button>
          ))}
        </div>
        <div className="mt-12 p-8 bg-brand-light rounded-sm">
          <h3 className="text-sm font-black uppercase tracking-widest mb-4">Thông tin liên hệ</h3>
          <p className="text-sm text-gray-600 font-medium">Email: support@fitgear.com</p>
          <p className="text-sm text-gray-600 font-medium">Hotline: 1900 1234 (8:00 - 22:00 hàng ngày)</p>
        </div>
      </div>
    )
  },
  'about-us': {
    title: 'Về chúng tôi',
    icon: <Users className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Câu chuyện của FITGEAR</h2>
        <p className="text-sm text-gray-600 font-medium leading-relaxed">
          FITGEAR được thành lập vào năm 2026 với một sứ mệnh duy nhất: Cung cấp trang phục thể thao chất lượng cao nhất để giúp mọi người đạt được mục tiêu rèn luyện thể chất của mình.
        </p>
        <p className="text-sm text-gray-600 font-medium leading-relaxed">
          Chúng tôi tin rằng trang phục không chỉ là thứ bạn mặc, mà là một phần của hành trình chinh phục bản thân. Mỗi sản phẩm của FITGEAR đều được nghiên cứu và thử nghiệm bởi các vận động viên chuyên nghiệp để đảm bảo hiệu suất tối ưu.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
          <img src="https://picsum.photos/seed/fitness1/800/600" alt="About Fitgear" className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700" />
          <img src="https://picsum.photos/seed/fitness2/800/600" alt="About Fitgear" className="rounded-sm grayscale hover:grayscale-0 transition-all duration-700" />
        </div>
      </div>
    )
  },
  'student-discount': {
    title: 'Giảm giá sinh viên',
    icon: <GraduationCap className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <div className="bg-brand-dark text-white p-12 rounded-sm text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">GIẢM 10% CHO SINH VIÊN</h2>
          <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-70">Dành cho tất cả sinh viên toàn quốc</p>
        </div>
        <div className="mt-10 space-y-8">
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4">Làm thế nào để nhận ưu đãi?</h3>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              1. Đăng ký tài khoản FITGEAR bằng email sinh viên (.edu).<br/>
              2. Xác thực thẻ sinh viên qua hệ thống đối tác của chúng tôi.<br/>
              3. Nhận mã giảm giá 10% áp dụng cho mọi đơn hàng.
            </p>
          </section>
          <button className="w-full py-5 bg-brand-dark text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all">
            Xác thực ngay
          </button>
        </div>
      </div>
    )
  }
};

export const InfoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const page = slug ? PAGE_DATA[slug] : null;

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4 uppercase">Không tìm thấy trang</h2>
          <button onClick={() => navigate('/')} className="text-xs font-bold uppercase tracking-widest underline">Quay lại trang chủ</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-10"
    >
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-dark mb-12 transition-colors"
        >
          <ChevronLeft size={14} /> Quay lại
        </button>

        <div className="flex items-center gap-6 mb-12">
          <div className="p-4 bg-brand-light rounded-sm text-brand-dark">
            {page.icon}
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
            {page.title}
          </h1>
        </div>

        <div className="mt-16">
          {page.content}
        </div>
      </div>
    </motion.div>
  );
};
