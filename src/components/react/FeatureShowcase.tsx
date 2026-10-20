import { motion } from 'motion/react';
import Icon from 'astro-iconset/react';

import warehouseImg from '@assets/photo-1553413077-190dd305871c.jpg';
import truckImg from '@assets/photo-1601584115197-04ecc0da31d7.jpg';
import packageImg from '@assets/photo-1581091226825-a6a2a5aee158.jpg';
import barChart3Img from '@assets/photo-1551288049-bebda4e38f71.jpg';
import shieldImg from '@assets/photo-1563013544-824ae1b704d3.jpg';
import headphonesImg from '@assets/photo-1486312338219-ce68d2c6f44d.jpg';

const features = [
  {
    icon: 'lucide:warehouse',
    title: 'Tooling & Molding',
    description: 'Xinyinhai’s toolroom supports mold machining, adjustment and repair alongside injection molding.',
    image: warehouseImg,
  },
  {
    icon: 'lucide:truck',
    title: 'Assembly & Packaging',
    description: 'Xinyinhai’s work instructions describe component fitting, process checks and preparation for packing.',
    image: truckImg,
  },
  {
    icon: 'lucide:package',
    title: 'Quality Controls',
    description: 'Xinyinhai’s documented inspection methods connect product requirements with acceptance criteria.',
    image: packageImg,
  },
  {
    icon: 'lucide:bar-chart-3',
    title: 'Development Review',
    description: 'Review the intended use, design inputs and verification needs with the project team.',
    image: barChart3Img,
  },
  {
    icon: 'lucide:shield',
    title: 'Project Confidentiality',
    description: 'Agree the scope and conditions for sharing restricted project information before exchange.',
    image: shieldImg,
  },
  {
    icon: 'lucide:headphones',
    title: 'Project Communication',
    description: 'Share your product brief so the relevant work, responsibilities and next step can be discussed.',
    image: headphonesImg,
  },
];

export default function FeatureShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              <motion.img
                src={feature.image.src}
                alt={`Illustrative stock photograph: ${feature.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/50 to-transparent opacity-60" />
              
              {/* Icon overlay */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                className="absolute top-4 right-4 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg"
              >
                <Icon name={feature.icon} className="w-6 h-6 text-primary-600" />
              </motion.div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-200 opacity-90">{feature.description}</p>
              <p className="text-xs text-gray-300 mt-2">Illustrative photography</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

