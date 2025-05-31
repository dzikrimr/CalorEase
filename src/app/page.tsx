// pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#E0F2F1] text-[#333]"> {/* Background mint green */}
      <Head>
        <title>CalorEase - Temukan Resep Sehat</title>
        <meta name="description" content="Aplikasi untuk mencari resep makanan sehat, kalkulasi kalori, dan marketplace bahan makanan." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-2">
        <section className="hero-section flex flex-col lg:flex-row items-center justify-between">
          <div className="text-content lg:w-1/2 p-4">
            <h1 className="text-5xl font-bold leading-tight mb-6 text-[#1A4D4A]"> {/* Dark accent for headline */}
              Find the Best Healthy Recipes, Achieve Your Dream Lifestyle
            </h1>
            <p className="text-lg mb-8 text-[#555]">
              Discover an array of healthy recipes, manage, and achieve desired wellness outcomes.
            </p>
            <div className="flex space-x-4">
              <button className="bg-[#1A4D4A] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#333] transition-colors">
                Try Now for Free
              </button>
              <button className="border border-[#1A4D4A] text-[#1A4D4A] px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#333] hover:text-white transition-colors">
                Login/Register
              </button>
            </div>
          </div>
          <div className="image-content lg:w-1/2 p-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl p-4 shadow-lg"> {/* Card-like background for image */}
                <Image
                    src="/cover-page.jpg" // Placeholder, replace with your actual collage image
                    alt="Various healthy dishes"
                    width={600}
                    height={400}
                    layout="responsive"
                    className="rounded-2xl"
                />
            </div>
          </div>
        </section>

        <section className="features-section py-20 text-center">
          <h2 className="text-4xl font-bold mb-12 text-[#1A4D4A]">Fitur Unggulan Kami</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <Image src="/ic_outline-search.png" alt="Recipe Search" width={60} height={60} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Recipe Search</h3>
              <p className="text-sm text-[#555]">Seamless exploration</p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <Image src="/calculation-ic.png" alt="Calorie Calculation" width={60} height={60} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Calorie Calculation</h3>
              <p className="text-sm text-[#555]">Calorie tracker and management tools</p>
            </div>
            <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <Image src="/chat.png" alt="Chatbot" width={60} height={60} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Chatbot</h3>
              <p className="text-sm text-[#555]">Featured dietary guidance</p>
            </div>
             <div className="feature-card bg-white p-6 rounded-lg shadow-md">
              <Image src="/marketplace-ic.png" alt="Online Food Marketplace" width={60} height={60} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Online Food Marketplace</h3>
              <p className="text-sm text-[#555]">Access fresh healthy ingredients</p>
            </div>
          </div>
        </section>

        <section className="testimonials-section py-5">
          <h2 className="text-4xl font-bold mb-12 text-center text-[#1A4D4A]">Apa Kata Pengguna Kami?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="testimonial-card bg-white p-6 rounded-lg shadow-md flex items-center">
              <div>
                <p className="italic text-[#555]">"CalorEase benar-benar mengubah cara saya memasak dan makan sehat. Resepnya enak dan fitur kalkulator kalorinya sangat membantu!"</p>
                <p className="font-semibold mt-2">- Positive User</p>
              </div>
            </div>
            <div className="testimonial-card bg-white p-6 rounded-lg shadow-md flex items-center">
              <div>
                <p className="italic text-[#555]">"Sangat mudah untuk mencari resep dan berbelanja bahan makanan. Aplikasi ini sangat direkomendasikan!"</p>
                <p className="font-semibold mt-2">- Online Food Marketplace User</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1A4D4A] text-white py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <nav className="footer-nav mb-4 md:mb-0">
          </nav>
        </div>
        <p className="text-center text-sm mt-8">&copy; {new Date().getFullYear()} CalorEase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;