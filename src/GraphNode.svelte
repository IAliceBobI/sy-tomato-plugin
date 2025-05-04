<script lang="ts">
    import { Handle, Position, NodeProps } from "@xyflow/svelte";
    type $$Props = NodeProps & { data: GraphNodeData };
    export let data: GraphNodeData;
    $$restProps;
</script>

<div style="background-color: {data.color};">
    <Handle type="target" position={Position.Top} />
    <div class="node">
        {data.text}
    </div>
    <Handle type="source" position={Position.Bottom} />
</div>

<style>
    .node {
        color: black;
    }
</style>
