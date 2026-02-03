import rtLogo from "@/components/images/rt_full-logo.svg";

export default function SiteHeader() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-2 shadow-md fixed top-0 left-0 z-50" style={{minHeight:'48px', background: 'black'}}>
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-left"
        style={{ fontFamily: 'Times New Roman, Times, serif', color: 'white' }}
      >
        RealThingks Automated Testing Framework
      </h1>
      <div className="w-15 h-13 sm:w-23 sm:h-23
       flex items-center justify-center ml-4">
        <img
          src={rtLogo}
          alt="RealThingks Logo"
          className="w-20 h-20 sm:w-28 sm:h-23 object-contain"
          style={{ background: 'transparent' }}
        />
      </div>
    </header>
  );
}
