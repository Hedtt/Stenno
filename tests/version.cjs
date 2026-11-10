const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

const properties=Object.fromEntries(read('version.properties').trim().split(/\r?\n/).map(line=>line.split('=',2)));
assert.deepEqual(Object.keys(properties).sort(),['VERSION_CODE','VERSION_NAME']);
assert.match(properties.VERSION_CODE,/^[1-9]\d*$/,'VERSION_CODE muss positiv sein');
assert.match(properties.VERSION_NAME,/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/,'VERSION_NAME muss eine SemVer-Version sein');

const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,properties.VERSION_NAME,'package.json und Android-Version weichen ab');
assert.equal(lock.version,properties.VERSION_NAME,'package-lock.json und Android-Version weichen ab');
assert.equal(lock.packages[''].version,properties.VERSION_NAME,'Root-Paket im Lockfile weicht ab');

const gradle=read('app/build.gradle');
assert.match(gradle,/versionCode versionProperties\['VERSION_CODE'\]\.toInteger\(\)/);
assert.match(gradle,/versionName versionProperties\['VERSION_NAME'\]/);

const directBuild=read('scripts/build-apk.sh');
assert.match(directBuild,/VERSION_FILE="\$PWD\/version\.properties"/);
assert.match(directBuild,/VERSION_CODE="\$\(sed -n 's\/\^VERSION_CODE=\/\/p' "\$VERSION_FILE"/);
assert.match(directBuild,/export VERSION_CODE VERSION_NAME/);
assert.match(directBuild,/os\.environ\["VERSION_CODE"\]/);
assert.match(directBuild,/os\.environ\["VERSION_NAME"\]/);

console.log(`PASS: Version ${properties.VERSION_NAME} (Code ${properties.VERSION_CODE}) ist in Paket, Gradle und Direkt-Build konsistent.`);
