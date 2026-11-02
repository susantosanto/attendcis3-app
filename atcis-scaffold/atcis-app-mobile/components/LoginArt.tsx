import { Platform, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';
import { HERO_SVG } from './heroSvg';

/**
 * Hero login: ilustrasi unDraw "Time Management" (lisensi MIT, bebas pakai
 * komersial) yang di-recolor ke biru brand. Tipis, profesional, ringan.
 * Sumber: https://undraw.co/illustration/time-management_4ss6
 * Catatan: build web react-native-svg tidak mengekspor SvgXml,
 * jadi web pakai Image data-URI, native pakai SvgXml.
 */
export function HeroArt({ h = 168, mt = 10 }: { h?: number; mt?: number }) {
  if (Platform.OS === 'web') {
    const React = require('react');
    const uri = 'data:image/svg+xml;utf8,' + encodeURIComponent(HERO_SVG);
    return (
      <View style={{ height: h, marginTop: mt, alignItems: 'center' }}>
        {React.createElement('img', {
          src: uri,
          alt: 'Ilustrasi kehadiran',
          style: { width: '100%', height: h, objectFit: 'contain' },
        })}
      </View>
    );
  }
  return (
    <View style={{ height: h, marginTop: mt, alignItems: 'center' }}>
      <SvgXml xml={HERO_SVG} width="100%" height={h} />
    </View>
  );
}

/** Bayangan pola halus di kartu putih login (sudut kanan atas, sangat redup). */
export function CardPattern() {
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      dots.push(<Circle key={`${r}-${c}`} cx={268 + c * 10} cy={10 + r * 10} fill="#E7EDF5" r={1.8} />);
    }
  }
  return (
    <View style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 36, opacity: 0.7 }} pointerEvents="none">
      <Svg width={140} height={36} viewBox="200 0 140 36">
        {dots}
        <Circle cx={218} cy={26} r={12} fill="#F1F4FA" />
      </Svg>
    </View>
  );
}
