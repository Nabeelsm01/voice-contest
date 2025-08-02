import React from "react";

const Condition = () => {
  return (
    <div className="bg-white min-h-screen">
    <div className="flex flex-col p-6 md:p-12 max-w-5xl mx-auto text-gray-800">
      {/* Header */}
      <h1 className="text-[18px] md:text-2xl font-bold text-orange-500 mb-6">
        นโยบายความเป็นส่วนตัว (Privacy Policy)
      </h1>
      
      <h1 className="text-sm md:text-xl mb-2 font-semibold">
      นโยบายเกี่ยวกับการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคล
      </h1>
      <section className="mb-6">
        <h2 className="md:md:text-lg text-sm font-semibold mb-2">
          1. แหล่งที่มาของข้อมูลส่วนบุคคล
        </h2>
        <p className="md:md:text-lg text-sm leading-relaxed">
          บริษัทอาจเก็บรวบรวมข้อมูลส่วนบุคคลของท่านจากแหล่งต่าง ๆ ดังต่อไปนี้:
        </p>
        <ul className="list-disc ml-6 mt-2 md:md:text-lg text-sm ">
          <li>
            จากท่านโดยตรง เช่น ข้อมูลที่ท่านให้ไว้ขณะลงทะเบียนสมัครสมาชิก การใช้บริการ หรือการปรับปรุงข้อมูลบัญชีผู้ใช้งาน (Account) ของท่าน
          </li>
          <li>
            เพื่อให้มั่นใจว่าข้อมูลของท่านเป็นปัจจุบัน และเพื่อพัฒนาคุณภาพของผลิตภัณฑ์และการให้บริการของบริษัทให้ดียิ่งขึ้น
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="md:text-lg text-sm font-semibold mb-2">
          2. ประเภทของข้อมูลส่วนบุคคลที่บริษัทเก็บรวบรวม
        </h2>
        <ul className="list-disc ml-6 md:md:text-lg text-sm">
          <li>ข้อมูลระบุตัวตน เช่น ชื่อ-นามสกุล, เพศ, หมายเลขโทรศัพท์, อีเมล</li>
          <li>ข้อมูลเสียง ภาพ หรือข้อมูลอิเล็กทรอนิกส์อื่น ๆ ที่สามารถใช้ระบุตัวตนของท่านได้</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="md:text-lg text-sm font-semibold mb-2">
          3. วัตถุประสงค์ในการเก็บรวบรวมข้อมูลส่วนบุคคล
        </h2>
        <p className="md:md:text-lg text-sm leading-relaxed">
          บริษัทจะใช้ข้อมูลส่วนบุคคลของท่านเพื่อมอบบริการที่ตรงตามความต้องการของท่าน รวมถึงเพื่อพัฒนาคุณภาพของระบบและบริการต่าง ๆ
        </p>
      </section>

      <section className="mb-6">
        <h2 className="md:text-lg text-sm font-semibold mb-2">
          4. การเปิดเผยข้อมูลส่วนบุคคล
        </h2>
        <p className="md:md:text-lg text-sm leading-relaxed">
          บริษัทให้ความสำคัญกับความเป็นส่วนตัวของท่านและจะไม่นำข้อมูลส่วนบุคคลไปเปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับความยินยอมล่วงหน้าจากท่าน
        </p>
        <ul className="list-disc ml-6 mt-2 md:md:text-lg text-sm">
          <li>
            บุคลากรที่เกี่ยวข้องภายในบริษัท ซึ่งจะได้รับมอบหมายให้ปฏิบัติงานที่เกี่ยวข้องกับการให้บริการ
          </li>
          <li>
            บริษัทจะดำเนินมาตรการที่เหมาะสมเพื่อให้บุคคลเหล่านั้นรักษาความลับของข้อมูลส่วนบุคคลของท่าน
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="md:text-lg text-sm font-semibold mb-2">5. การใช้คุกกี้ (Cookies)</h2>
        <p className="md:md:text-lg text-sm leading-relaxed">
          คุกกี้ถูกใช้เพื่ออำนวยความสะดวกในการใช้งานเว็บไซต์ และเพื่อพัฒนาประสบการณ์การเข้าชมเว็บไซต์และแอปพลิเคชันให้ตรงตามความต้องการของท่าน
        </p>
      </section>

      <section className="mb-6">
        <h2 className="md:text-lg text-sm font-semibold mb-2">
          6. สิทธิของท่านเกี่ยวกับข้อมูลส่วนบุคคล
        </h2>
        <ul className="list-disc ml-6 md:md:text-lg text-sm ">
          <li>การแก้ไขหรือปรับปรุงข้อมูลส่วนบุคคล</li>
          <li>การลบข้อมูลส่วนบุคคลภายใต้เงื่อนไขที่กฎหมายกำหนด</li>
        </ul>
      </section>

      <p className="md:md:text-lg text-sm  leading-relaxed">
        หากท่านมีข้อสงสัยเพิ่มเติมเกี่ยวกับนโยบายการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคล ท่านสามารถติดต่อบริษัทผ่านช่องทางที่กำหนดไว้ในเว็บไซต์หรือนโยบายความเป็นส่วนตัวของบริษัท
      </p>
    </div>
    </div>
  );
};

export default Condition;
