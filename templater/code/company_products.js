let company = dv.current();
let software = dv.pages('#software AND !#summary')
	.where(p => p.company && dv.page(p.company)?.file?.name === company.file.name)
	.sort(p => p.file.name);
let hardware = dv.pages('#hardware AND !#summary')
	.where(p => p.company && dv.page(p.company)?.file?.name === company.file.name)
	.sort(p => p.file.name);
	
if (software.length > 0) {
	dv.paragraph("### Software");
	dv.table(
		["Software", "Category", "Sub Category", "Updated"],
		software
			.map(p => [ 
				p.file.link, 
				p.category, 
				p.sub_category, 
				p.file.mday 
			])
	);
}

if (hardware.length > 0) {
	dv.paragraph("### Hardware")
	dv.table(
		["Software", "Category", "Sub Category", "Updated"],
		hardware
			.map(
				p => [ 
					p.file.link, 
					p.category, 
					p.sub_category, 
					p.file.mday 
				]
			)
	);
}
if (software.length === 0 && hardware.length === 0) {
	dv.paragraph(`- No products found for ${company.file.name}`) 
} 
