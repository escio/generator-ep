<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.google.com/schemas/sitemap/0.84">
	{foreach from=$arr_items item='arr_item'}
		<url>
			<loc>{$arr_item.urlEffective|lower}</loc>
		</url>
	{/foreach}
	
</urlset>