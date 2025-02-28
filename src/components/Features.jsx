import React from 'react';

const Features = () => {
  return (
    <div className="features-container">
      <h2>Özellikler</h2>
      <div className="features">
        <div className="feature">
          <h3>Kolay Kullanım</h3>
          <p>Fatura oluşturma işlemi sadece birkaç adımda tamamlanır. Kullanıcı dostu arayüz.</p>
        </div>
        <div className="feature">
          <h3>PDF İndirme</h3>
          <p>Faturalarınızı kolayca PDF formatında indirebilirsiniz.</p>
        </div>
        <div className="feature">
          <h3>Fiyatlandırma Desteği</h3>
          <p>Fatura içeriğine göre kolayca fiyatlandırma yapın ve faturanızı oluşturun.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
