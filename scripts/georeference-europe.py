"""Read the licensed SVG references and measure their registration to WGS84.

This preparation script writes research intermediates, never a published layer.
The vector authors' country outlines must be checked against historical sources.
"""
import json, re, sys, xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np
from svgpathtools import parse_path
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union, transform
from shapely import make_valid
from pyproj import Transformer

BASE=Path(__file__).resolve().parents[3]
RESEARCH=BASE/'outputs/map-completion/research'

def matrix(text):
    result=np.eye(3)
    for kind,body in re.findall(r'(matrix|translate|scale)\s*\(([^)]+)\)',text or ''):
        a=[float(v) for v in re.split(r'[ ,]+',body.strip())]
        if kind=='matrix':m=np.array([[a[0],a[2],a[4]],[a[1],a[3],a[5]],[0,0,1]])
        elif kind=='translate':m=np.array([[1,0,a[0]],[0,1,a[1] if len(a)>1 else 0],[0,0,1]])
        else:m=np.diag([a[0],a[-1],1])
        result=result@m
    return result

def read_svg(file):
    root=ET.parse(file).getroot(); result={}
    def visit(e,parent):
        m=parent@matrix(e.get('transform'))
        if e.tag.endswith('path') and e.get('d'):
            rings=[]
            for p in parse_path(e.get('d')).continuous_subpaths():
                # SVG fill closes open subpaths implicitly. Requiring an
                # explicit Z would silently omit several national polygons.
                if 'fill:none' in (e.get('style') or ''):continue
                coords=[]
                for seg in p:
                    distance=abs(seg.end-seg.start)*max(abs(m[0,0]),abs(m[1,1]))
                    for t in np.linspace(0,1,max(2,int(distance/8)+1)):
                        z=seg.point(t); v=m@np.array([z.real,z.imag,1]);coords.append(v[:2])
                if len(coords)>3:rings.append(make_valid(Polygon(coords)))
            if rings:result[e.get('id')]=unary_union(rings)
        for c in e:visit(c,m)
    visit(root,np.eye(3));return result

if __name__=='__main__':
    shapes=read_svg(RESEARCH/'europe-1939.svg')
    anchors={'ad':(1.571,42.547),'li':(9.554,47.159),'mc-7':(7.425,43.738),'sm-1':(12.459,43.942),'va-1':(12.4534,41.9029),'mt':(14.40,35.94)}
    src=np.array([[shapes[k].centroid.x,shapes[k].centroid.y] for k in anchors]);dst=np.array(list(anchors.values()))
    for proj in ['EPSG:3857','EPSG:3035','+proj=laea +lat_0=45 +lon_0=10 +datum=WGS84','+proj=aeqd +lat_0=50 +lon_0=10 +datum=WGS84','+proj=eqc +lat_ts=45 +datum=WGS84']:
        tr=Transformer.from_crs('EPSG:4326',proj,always_xy=True);xy=np.array(tr.transform(*dst.T)).T
        fit=np.linalg.lstsq(np.column_stack([src,np.ones(len(src))]),xy,rcond=None)[0]
        error=np.sqrt(np.mean(np.sum((np.column_stack([src,np.ones(len(src))])@fit-xy)**2,axis=1)))
        print(proj,'anchor RMS metres',round(error),fit.tolist())
    (RESEARCH/'svg-pixel-geometries.json').write_text(json.dumps({k:mapping(g) for k,g in shapes.items()}))
    print('Paths',[(k,tuple(round(v) for v in g.bounds)) for k,g in shapes.items() if g.area>1000])
