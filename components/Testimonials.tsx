const testimonials = [
  {
    text: "ㅣ서 벗어나지 않는 결과",
    student: "김*성"
  },
  {
    text: "결국 수능 때 1등급",
    student: "이*민"
  },
  {
    text: "모두 1등급을 유지",
    student: "박*준"
  },
  {
    text: "자연스럽게 1등급",
    student: "최*영"
  },
  {
    text: "1등급, 백분위 99라는 성과",
    student: "정*호"
  },
  {
    text: "심히 노력한 결과 수능 1등급",
    student: "한*수"
  },
  {
    text: "4등급에서 수능 1등급까지",
    student: "윤*지"
  },
  {
    text: "덕분에 수능에서 1등급",
    student: "조*현"
  },
  {
    text: "충분히 1등급",
    student: "임*성"
  },
  {
    text: "수능에서 다시 한번 1등급",
    student: "강*우"
  },
  {
    text: "쟁취 수능 국어에서 1등급을 달성",
    student: "송*진"
  },
  {
    text: "안정 1등급을 받은 수능까지",
    student: "오*민"
  },
  {
    text: "가뿐히 1등급",
    student: "서*훈"
  },
  {
    text: "원점수 96점으로 1등급",
    student: "노*희"
  },
  {
    text: "수능에서 1등급이라는",
    student: "홍*연"
  }
]

// 3줄로 나누기
const firstRow = testimonials.slice(0, 5)
const secondRow = testimonials.slice(5, 10)
const thirdRow = testimonials.slice(10, 15)

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">
            수능 국어 1등급으로 가는 마지막 점검<br />
            <span className="highlight-text">선배들의 경험이 증명하는</span>
          </h2>
        </div>

        <div className="testimonials-container">
          {/* 첫 번째 줄 - 오른쪽으로 흐름 */}
          <div className="testimonials-row scroll-right">
            {[...firstRow, ...firstRow].map((testimonial, index) => (
              <div key={`first-${index}`} className="testimonial-card">
                <p className="testimonial-text">
                  {testimonial.text.split('1등급').map((part, i) => 
                    i === 0 ? part : (
                      <span key={i}>
                        <span className="grade-highlight">1등급</span>
                        {part}
                      </span>
                    )
                  )}
                </p>
                <p className="student-name">- 수강생 {testimonial.student} -</p>
              </div>
            ))}
          </div>

          {/* 두 번째 줄 - 왼쪽으로 흐름 */}
          <div className="testimonials-row scroll-left">
            {[...secondRow, ...secondRow].map((testimonial, index) => (
              <div key={`second-${index}`} className="testimonial-card">
                <p className="testimonial-text">
                  {testimonial.text.split('1등급').map((part, i) => 
                    i === 0 ? part : (
                      <span key={i}>
                        <span className="grade-highlight">1등급</span>
                        {part}
                      </span>
                    )
                  )}
                </p>
                <p className="student-name">- 수강생 {testimonial.student} -</p>
              </div>
            ))}
          </div>

          {/* 세 번째 줄 - 오른쪽으로 흐름 */}
          <div className="testimonials-row scroll-right">
            {[...thirdRow, ...thirdRow].map((testimonial, index) => (
              <div key={`third-${index}`} className="testimonial-card">
                <p className="testimonial-text">
                  {testimonial.text.split('1등급').map((part, i) => 
                    i === 0 ? part : (
                      <span key={i}>
                        <span className="grade-highlight">1등급</span>
                        {part}
                      </span>
                    )
                  )}
                </p>
                <p className="student-name">- 수강생 {testimonial.student} -</p>
              </div>
            ))}
          </div>
        </div>

        <p className="disclaimer">
          * 수강생 2025학년도 수능 성적 인증 후기 중 발췌
        </p>
      </div>
    </section>
  )
}
