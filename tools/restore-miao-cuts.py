"""Restore missing PNG exports byte-for-byte from the existing OpenRaster file."""
from pathlib import Path
import zipfile
root = Path(__file__).resolve().parent.parent / 'assets/feifei-layers/02-miaoyinniao'
names = ['base', 'wings-rear', 'body', 'prop-front', 'grips-front']
with zipfile.ZipFile(root / '02-miaoyinniao.ora') as archive:
    for index, name in enumerate(names):
        target = root / (name + '.png')
        data = archive.read(f'data/layer-{index}.png')
        if not target.exists():
            target.write_bytes(data)
        assert target.read_bytes() == data, name + ': archive differs; do not overwrite'
print('Five original cut PNGs verified against existing ORA; no repaint.')
