export default function InstructorBanner() {
  return (
    <section className="instructor-banner">
      <div className="container">
        <div className="banner-content">
          <div className="banner-text">
            <h2 className="banner-title">
              <span className="white-text">우리들의</span>
              <br />
              <span className="red-text">기출분석</span>
            </h2>
            <p className="banner-subtitle">평가원을 잘 아는 강민철의 FINAL ►</p>
          </div>
          <div className="instructor-image">
            <img 
              src="https://via.placeholder.com/200x200/2c3e50/ffffff?text=강민철" 
              alt="강민철 선생님"
            />
          </div>
        </div>
        <p className="example-text">예시</p>
      </div>
    </section>
  )
}
