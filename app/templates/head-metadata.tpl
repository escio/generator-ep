<link rel="canonical" href="http://{$smarty.server.HTTP_HOST}{$smarty.server.REQUEST_URI}" />
{foreach item=metaitem from=$arr_items}
    {if $metaitem.name != 'image'}
        <meta name="{$metaitem.name}" content="{$metaitem.content|addslashes}" />
    {/if}
{/foreach}
{foreach item=og from=$arr_items}
    {if $og.name == 'image'}
       {insert_ep_object type="image" assign="image" returnType="array" width=200 imageId=$og.content}
           <meta property="og:image" content="{$image.url}"/>
        {/if}
        {if $og.name == 'description'}
           <meta property="og:description" content="{$og.content}"/>
        {/if}
{/foreach}