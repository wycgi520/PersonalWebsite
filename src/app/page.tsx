import Identity from '@/components/home/Identity';
import StarMap from '@/components/home/StarMap';

export default function HomePage() {
  return (
    <section className="scene on px-10 pt-[104px] pb-12" id="scene-home">
      <div className="home grid grid-cols-1 lg:grid-cols-[minmax(300px,38%)_1fr] gap-14 items-center max-w-[1440px] mx-auto min-h-[calc(100vh-152px)]">
        <Identity />
        <StarMap />
      </div>
    </section>
  );
}
