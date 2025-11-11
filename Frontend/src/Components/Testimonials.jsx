import React from "react";

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="px-6 md:px-16 py-24 bg-[--color-dark] text-[--color-light]"
    >
      {/* === Section Title === */}
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What Our Founders Say
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Hear how StartupLift has helped founders accelerate growth and
          connect with opportunities.
        </p>
      </div>

      {/* === Testimonial Card === */}
      <div className="max-w-3xl mx-auto bg-linear-to-b from-[#1C1C2E] to-[#12121C] p-10 rounded-2xl shadow-lg hover:shadow-[0_0_25px_#7C3AED30] transition">
        <p className="italic text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
          “StartupLift helped us refine our business model and connect with
          investors! The mentorship and community support were invaluable.”
        </p>

        <div className="flex items-center gap-5">
          {/* === Founder Avatar === */}
          <img
            src="https://randomuser.me/api/portraits/women/65.jpg"
            alt="Jane Cooper"
            className="w-14 h-14 rounded-full border-2 border-[--color-primary] object-cover"
          />

          {/* === Founder Info === */}
          <div>
            <h4 className="text-white font-semibold text-lg">Jane Cooper</h4>
            <p className="text-gray-400 text-sm">Co-founder, TechWave</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
